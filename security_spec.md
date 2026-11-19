# Security Specification — EduCity 3D Bahasa Inggris SMP

## 1. Data Invariants
1. `users/{userId}` can only be read or written by the authenticated owner (`request.auth.uid == userId`) or a verified Admin Guru (`isAdmin()`).
2. A non-teacher user cannot self-escalate `role` to `'teacher'` on `users/{userId}` unless verified as admin (`isAdmin()`).
3. `student_progress/{userId}` must maintain `uid == request.auth.uid` on create and immutable `uid` on update; array fields (`answeredCorrectIds`, `completedChapters`) are strictly bounded (`<= 100` and `<= 10`).
4. `city_presence/{sessionId}` contains zero PII (no email, phone, or UID exposure) and validates strict hex colors, bounded string sizes, and coordinate numbers.
5. `admins/{userId}` is read-only for the owner (`request.auth.uid == userId`) and cannot be written from client SDKs.
6. All document IDs (`userId`, `sessionId`) must match `^[a-zA-Z0-9_\\-]+$` and stay `<= 128` characters.

## 2. Dirty Dozen Adversarial Payloads (Must Return PERMISSION_DENIED)
1. Unauthenticated write to `users/{userId}`.
2. Authenticated user A reading `users/{userB}` (PII/profile leak).
3. Authenticated student writing `role: "teacher"` to `users/{uid}` (privilege escalation).
4. Shadow field injection (`isAdmin: true`) on `student_progress/{uid}`.
5. `uid` spoofing (`uid: "other_user"`) when creating `student_progress/{uid}`.
6. Oversized string (`name` > 80 chars) in `city_presence/{sessionId}`.
7. Invalid document ID (`sessionId = "a".repeat(200)`) on `city_presence`.
8. Unbounded array (`answeredCorrectIds` with 500 items) on `student_progress/{uid}`.
9. Client write to `admins/{uid}` to grant self admin privileges.
10. Invalid hex color (`shirtColor: "javascript:alert(1)"`) in `city_presence`.
11. Unauthenticated read of `student_progress/{uid}`.
12. Deleting another user's `student_progress/{userB}`.
