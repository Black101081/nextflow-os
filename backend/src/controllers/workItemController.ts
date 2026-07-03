import { Request, Response } from 'express';
import { query } from '../config/db';

// 1. POST /api/v1/work-items (Tạo mới Work Item)
export const createWorkItem = async (req: Request, res: Response) => {
  const { title, description, priority, due_date, category, source, external_id, metadata } = req.body;
  const tenantId = req.tenantId;
  const creatorId = req.userId === 'api_key_system' ? null : req.userId;

  // Validate các trường bắt buộc
  if (!title) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Trường title không được để trống.',
        details: [{ field: 'title', issue: 'must_not_be_empty' }]
      }
    });
  }

  // Validate priority
  const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const finalPriority = priority || 'MEDIUM';
  if (!validPriorities.includes(finalPriority)) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Độ ưu tiên không hợp lệ.',
        details: [{ field: 'priority', issue: 'invalid_priority_value' }]
      }
    });
  }

  // Validate due_date không được là thời gian quá khứ
  if (due_date) {
    const dueTime = new Date(due_date).getTime();
    if (dueTime < Date.now()) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Trường due_date không thể là thời gian trong quá khứ.',
          details: [{ field: 'due_date', issue: 'must_be_future_date' }]
        }
      });
    }
  }

  try {
    const insertQuery = `
      INSERT INTO nf_core.work_items (
        tenant_id, title, description, priority, due_at, category, source, external_id, metadata, creator_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'UNASSIGNED')
      RETURNING id, title, status, priority, created_at, due_at, version
    `;
    
    const dbRes = await query(insertQuery, [
      tenantId,
      title,
      description || null,
      finalPriority,
      due_date ? new Date(due_date) : null,
      category || 'GENERAL',
      source || 'MANUAL',
      external_id || null,
      metadata ? JSON.stringify(metadata) : '{}',
      creatorId
    ]);

    const createdItem = dbRes.rows[0];

    return res.status(201).json({
      id: createdItem.id,
      title: createdItem.title,
      status: createdItem.status,
      priority: createdItem.priority,
      created_at: createdItem.created_at,
      due_date: createdItem.due_at,
      sla_status: 'WITHIN_SLA',
      version: createdItem.version
    });
  } catch (err: any) {
    console.error('[WorkItem Controller] Create error:', err.message);
    return res.status(500).json({
      error: {
        code: 'SYSTEM_FAULT',
        message: 'Lỗi máy chủ khi tạo mới Work Item.'
      }
    });
  }
};

// 2. PATCH /api/v1/work-items/{id}/status (Cập nhật trạng thái)
export const updateWorkItemStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  const tenantId = req.tenantId;
  const userId = req.userId === 'api_key_system' ? null : req.userId;

  const validStatuses = ['UNASSIGNED', 'IN_PROGRESS', 'SUSPENDED', 'COMPLETED', 'CANCELLED'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Trạng thái cập nhật không hợp lệ.',
        details: [{ field: 'status', issue: 'invalid_status_value' }]
      }
    });
  }

  try {
    // 1. Kiểm tra xem Task có tồn tại và thuộc Tenant ID không (Tenant Isolation)
    const taskRes = await query(
      'SELECT id, status, assignee_id, version FROM nf_core.work_items WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (taskRes.rowCount === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Không tìm thấy Work Item tương ứng với Tenant này.'
        }
      });
    }

    const currentTask = taskRes.rows[0];

    // Thiết lập thời gian bắt đầu hoặc kết thúc nếu chuyển trạng thái
    let startedAtUpdate = '';
    let completedAtUpdate = '';
    const queryParams: any[] = [status, id, tenantId];

    if (status === 'IN_PROGRESS' && currentTask.status === 'UNASSIGNED') {
      startedAtUpdate = ', started_at = CURRENT_TIMESTAMP';
    } else if (status === 'COMPLETED' && currentTask.status !== 'COMPLETED') {
      completedAtUpdate = ', completed_at = CURRENT_TIMESTAMP';
    }

    // Nếu gán trạng thái là IN_PROGRESS, tự động gán user hiện tại làm assignee nếu chưa có
    let assigneeUpdate = '';
    if (status === 'IN_PROGRESS' && !currentTask.assignee_id && userId) {
      assigneeUpdate = ', assignee_id = $4';
      queryParams.push(userId);
    }

    const updateQuery = `
      UPDATE nf_core.work_items 
      SET status = $1, version = version + 1 ${startedAtUpdate} ${completedAtUpdate} ${assigneeUpdate}
      WHERE id = $2 AND tenant_id = $3
      RETURNING id, status, updated_at, version
    `;

    const updateRes = await query(updateQuery, queryParams);
    const updatedTask = updateRes.rows[0];

    return res.status(200).json({
      id: updatedTask.id,
      status: updatedTask.status,
      updated_at: updatedTask.updated_at,
      version: updatedTask.version
    });
  } catch (err: any) {
    console.error('[WorkItem Controller] Update error:', err.message);
    return res.status(500).json({
      error: {
        code: 'SYSTEM_FAULT',
        message: 'Lỗi máy chủ khi cập nhật trạng thái Work Item.'
      }
    });
  }
};

// 3. GET /api/v1/work-items/{id} (Xem chi tiết)
export const getWorkItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.tenantId;

  try {
    const taskRes = await query(
      'SELECT * FROM nf_core.work_items WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (taskRes.rowCount === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Không tìm thấy Work Item yêu cầu.'
        }
      });
    }

    return res.status(200).json(taskRes.rows[0]);
  } catch (err: any) {
    console.error('[WorkItem Controller] Get error:', err.message);
    return res.status(500).json({
      error: {
        code: 'SYSTEM_FAULT',
        message: 'Lỗi máy chủ khi lấy chi tiết Work Item.'
      }
    });
  }
};
