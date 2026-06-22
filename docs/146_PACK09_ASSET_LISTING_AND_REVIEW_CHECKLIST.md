# Nextflow OS – Pack 09: Asset Listing and Review Checklist

**Document ID:** 146_PACK09_ASSET_LISTING_AND_REVIEW_CHECKLIST  
**Version:** 1.0  
**Status:** Checklist  
**Primary Owner:** Marketplace Ops / Security / Product  
**Related docs:** 142 Catalog Model, 144 Policies, 145 Ops & SLA

---

## 1. Metadata completeness
- [ ] Name, slug, version, owner đầy đủ
- [ ] Asset type, categories, tags hợp lệ
- [ ] Short description và long description rõ ràng
- [ ] Support contact hợp lệ
- [ ] Compatibility/version info đầy đủ

## 2. UX / listing quality
- [ ] Có screenshots hoặc visual hỗ trợ (nếu phù hợp)
- [ ] Không có claims gây hiểu lầm
- [ ] Permissions được mô tả dễ hiểu
- [ ] Installation guidance rõ ràng
- [ ] Uninstall impact được nêu rõ

## 3. Security / privacy
- [ ] Không hard-code secrets
- [ ] Secrets/config dùng secure storage
- [ ] Data access scope là tối thiểu cần thiết
- [ ] Có security disclosure path
- [ ] Nếu asset dùng AI, có disclose AI usage

## 4. Runtime / reliability
- [ ] Dependency graph rõ ràng
- [ ] Timeout / retry / graceful failure được thiết kế
- [ ] Logs/metrics/health signals có sẵn
- [ ] Rollback path rõ ràng khi update thất bại

## 5. Governance
- [ ] Publisher tier phù hợp (registered/verified/premier)
- [ ] Review status được cập nhật
- [ ] Nếu cần legal/security sign-off, đã có biên bản
