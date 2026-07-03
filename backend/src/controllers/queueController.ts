import { Request, Response } from 'express';
import { query } from '../config/db';

// 1. POST /api/v1/queues (Tạo Queue mới)
export const createQueue = async (req: Request, res: Response) => {
  const { id, name, category, routing_algorithm, sla_target_seconds } = req.body;
  const tenantId = req.tenantId;

  if (!id || !name || !category) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Các trường id, name, và category không được để trống.',
        details: [{ field: 'id/name/category', issue: 'missing_required_fields' }]
      }
    });
  }

  try {
    // Kiểm tra trùng lặp Queue ID
    const checkRes = await query('SELECT id FROM nf_core.queues WHERE id = $1', [id]);
    if ((checkRes.rowCount ?? 0) > 0) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Queue ID đã tồn tại trong hệ thống.',
          details: [{ field: 'id', issue: 'queue_id_already_exists' }]
        }
      });
    }

    const insertQuery = `
      INSERT INTO nf_core.queues (id, tenant_id, name, category, routing_algorithm, sla_target_seconds)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, category, routing_algorithm, sla_target_seconds, created_at
    `;

    const dbRes = await query(insertQuery, [
      id,
      tenantId,
      name,
      category,
      routing_algorithm || 'FIFO',
      sla_target_seconds || 3600
    ]);

    return res.status(201).json(dbRes.rows[0]);
  } catch (err: any) {
    console.error('[Queue Controller] Create error:', err.message);
    return res.status(500).json({
      error: {
        code: 'SYSTEM_FAULT',
        message: 'Lỗi máy chủ khi tạo mới Queue.'
      }
    });
  }
};

// 2. POST /api/v1/queues/{id}/members (Thêm thành viên vào Queue)
export const addQueueMember = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { user_id } = req.body;
  const tenantId = req.tenantId;

  if (!user_id) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Trường user_id không được để trống.',
        details: [{ field: 'user_id', issue: 'must_not_be_empty' }]
      }
    });
  }

  try {
    // 1. Kiểm tra Queue tồn tại và thuộc Tenant (Tenant Isolation)
    const queueRes = await query('SELECT id FROM nf_core.queues WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
    if ((queueRes.rowCount ?? 0) === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Không tìm thấy Queue tương ứng với Tenant này.'
        }
      });
    }

    // 2. Kiểm tra User tồn tại và thuộc Tenant (Tenant Isolation)
    const userRes = await query('SELECT id FROM nf_core.users WHERE id = $1 AND tenant_id = $2', [user_id, tenantId]);
    if ((userRes.rowCount ?? 0) === 0) {
      return res.status(422).json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Không tìm thấy người dùng tương ứng với Tenant này.',
          details: [{ field: 'user_id', issue: 'user_not_found_in_tenant' }]
        }
      });
    }

    // 3. Thêm vào bảng queue_members
    await query(
      'INSERT INTO nf_core.queue_members (queue_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [id, user_id]
    );

    return res.status(200).json({
      queue_id: id,
      user_id: user_id,
      status: 'ADDED'
    });
  } catch (err: any) {
    console.error('[Queue Controller] Add member error:', err.message);
    return res.status(500).json({
      error: {
        code: 'SYSTEM_FAULT',
        message: 'Lỗi máy chủ khi thêm thành viên vào Queue.'
      }
    });
  }
};

// 3. GET /api/v1/queues/{id}/members (Lấy danh sách thành viên)
export const getQueueMembers = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tenantId = req.tenantId;

  try {
    const queueRes = await query('SELECT id, name, category FROM nf_core.queues WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
    if ((queueRes.rowCount ?? 0) === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Không tìm thấy Queue.'
        }
      });
    }

    const membersQuery = `
      SELECT u.id AS user_id, u.first_name || ' ' || u.last_name AS name, u.role, u.is_active
      FROM nf_core.queue_members qm
      JOIN nf_core.users u ON qm.user_id = u.id
      WHERE qm.queue_id = $1 AND u.tenant_id = $2
    `;

    const membersRes = await query(membersQuery, [id, tenantId]);

    return res.status(200).json({
      queue_id: id,
      name: queueRes.rows[0].name,
      members: membersRes.rows
    });
  } catch (err: any) {
    console.error('[Queue Controller] Get members error:', err.message);
    return res.status(500).json({
      error: {
        code: 'SYSTEM_FAULT',
        message: 'Lỗi máy chủ khi lấy danh sách thành viên.'
      }
    });
  }
};

// 4. POST /api/v1/work-items/{id}/route (Định tuyến thủ công)
export const routeWorkItem = async (req: Request, res: Response) => {
  const { id } = req.params; // Work Item ID
  const { target_queue_id, assignee_id, note } = req.body;
  const tenantId = req.tenantId;

  try {
    // 1. Kiểm tra Work Item tồn tại và thuộc Tenant
    const taskRes = await query('SELECT id FROM nf_core.work_items WHERE id = $1 AND tenant_id = $2', [id, tenantId]);
    if ((taskRes.rowCount ?? 0) === 0) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Không tìm thấy Work Item.'
        }
      });
    }

    // 2. Validate Target Queue (nếu truyền vào)
    if (target_queue_id) {
      const qRes = await query('SELECT id FROM nf_core.queues WHERE id = $1 AND tenant_id = $2', [target_queue_id, tenantId]);
      if ((qRes.rowCount ?? 0) === 0) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Queue đích không tồn tại.',
            details: [{ field: 'target_queue_id', issue: 'queue_not_found' }]
          }
        });
      }
    }

    // 3. Validate Assignee (nếu truyền vào)
    if (assignee_id) {
      const uRes = await query('SELECT id FROM nf_core.users WHERE id = $1 AND tenant_id = $2', [assignee_id, tenantId]);
      if ((uRes.rowCount ?? 0) === 0) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Người nhận không tồn tại trong Tenant này.',
            details: [{ field: 'assignee_id', issue: 'user_not_found' }]
          }
        });
      }
    }

    // 4. Thực hiện Update định tuyến
    let setClause = 'status = $1, version = version + 1';
    const queryParams: any[] = [];
    
    // Mặc định chuyển sang UNASSIGNED nếu đổi queue mà không đổi người gán
    let nextStatus = 'UNASSIGNED';
    if (assignee_id) {
      nextStatus = 'IN_PROGRESS';
    }

    queryParams.push(nextStatus, id, tenantId);

    let paramIdx = 4;
    if (target_queue_id) {
      setClause += `, queue_id = $${paramIdx}`;
      queryParams.push(target_queue_id);
      paramIdx++;
    }
    if (assignee_id) {
      setClause += `, assignee_id = $${paramIdx}`;
      queryParams.push(assignee_id);
      paramIdx++;
    }

    const updateQuery = `
      UPDATE nf_core.work_items 
      SET ${setClause}
      WHERE id = $2 AND tenant_id = $3
      RETURNING id, queue_id, assignee_id, status
    `;

    const updateRes = await query(updateQuery, queryParams);
    const updatedTask = updateRes.rows[0];

    return res.status(200).json({
      work_item_id: updatedTask.id,
      routed_to_queue: updatedTask.queue_id,
      assigned_to: updatedTask.assignee_id,
      status: updatedTask.status,
      routed_at: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[Queue Controller] Route error:', err.message);
    return res.status(500).json({
      error: {
        code: 'SYSTEM_FAULT',
        message: 'Lỗi máy chủ khi thực hiện định tuyến.'
      }
    });
  }
};
