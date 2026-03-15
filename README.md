# NeoConnect

NeoConnect is a simple hackathon project for managing staff feedback, complaints, polls, public updates, and analytics.

The code is intentionally written in a junior-friendly style:

- Small files
- Clear variable names
- Simple API routes
- Basic role checks
- Straightforward React pages

## 1. Folder structure

This is the simple project structure used for the app.

```text
neo/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── .env.local.example
│   └── package.json
└── README.md
```

## 2. MongoDB schemas

These are the main MongoDB schemas used in the project:

- `User`
- `Complaint`
- `Poll`
- `Vote`
- `MeetingMinute`

The schema files are inside `backend/src/models`.

- `User.js` stores login details, role, department, and active status.
- `Complaint.js` stores the complaint form, tracking ID, assignment, notes, and escalation dates.
- `Poll.js` stores the poll question and options.
- `Vote.js` stores one vote per user per poll.
- `MeetingMinute.js` stores uploaded PDF details.

This project also includes a small `SystemSetting` model for admin settings.

Example documents are already prepared in `backend/src/data/exampleDocuments.js`.

Here is a simple example complaint document shape.

```json
{
  "trackingId": "NEO-2026-001",
  "title": "Broken emergency exit light",
  "category": "Safety",
  "department": "Operations",
  "location": "Block B",
  "severity": "High",
  "anonymous": false,
  "status": "Assigned"
}
```

## 3. Express backend setup

The backend uses:

- Node.js
- Express.js
- MongoDB with Mongoose
- Multer for file upload
- JWT for authentication
- Node cron for the daily escalation job

The backend entry files are:

- `backend/src/app.js`
- `backend/src/server.js`

Important backend folders:

- `controllers` for route logic
- `routes` for API endpoints
- `middleware` for auth and role checks
- `utils` for reusable helpers

## 4. API routes

These are the main API routes in the project.

| Feature | Method | Route |
| --- | --- | --- |
| Register | `POST` | `/register` |
| Login | `POST` | `/login` |
| Create complaint | `POST` | `/complaints` |
| List complaints | `GET` | `/complaints` |
| Single complaint | `GET` | `/complaints/:id` |
| Update complaint | `PATCH` | `/complaints/:id` |
| Create poll | `POST` | `/polls` |
| List polls | `GET` | `/polls` |
| Vote in poll | `POST` | `/polls/vote` |
| Upload minutes | `POST` | `/minutes` |
| List minutes | `GET` | `/minutes` |
| Analytics | `GET` | `/analytics` |

There are also a few helper routes:

- `GET /users`
- `PATCH /users/:id`
- `GET /settings`
- `PATCH /settings`

## 5. JWT authentication

Authentication is kept simple:

- User logs in with email and password
- Backend returns a JWT token
- Frontend stores token and user data in `localStorage`
- User stays logged in after refresh
- Protected pages read the saved token from `localStorage`

The main auth files are:

- `backend/src/middleware/authMiddleware.js`
- `backend/src/middleware/roleMiddleware.js`
- `backend/src/utils/generateToken.js`
- `frontend/lib/auth.js`
- `frontend/lib/useProtectedPage.js`

## 6. Next.js frontend setup

The frontend uses:

- Next.js app router
- React
- Tailwind CSS
- Small local shadcn-style UI components

The auth flow is also kept simple:

- One clean login/signup screen
- After login, the user is redirected to the correct role dashboard
- Dashboard routes are separated by role for easier demo explanation

The reusable UI components are inside `frontend/components/ui`.

These include:

- Button
- Input
- Textarea
- Select
- Card
- Badge
- Table
- Switch

## 7. Complaint form

The complaint form page is:

- `frontend/app/submit-complaint/page.js`

This form supports:

- Category
- Department
- Location
- Severity
- Anonymous toggle
- File upload
- Auto tracking ID after save

The tracking ID logic is inside:

- `backend/src/models/Complaint.js`

The generated format is:

```text
NEO-YYYY-001
```

## 8. Case management UI

The case pages are:

- `frontend/app/cases/page.js`
- `frontend/app/case/[id]/page.js`

Secretariat can:

- View all complaints
- Assign case manager
- Add public update text

Case manager can:

- View assigned cases
- Change status
- Add notes
- Close case by setting status to `Resolved`

## 9. Poll system

The poll page is:

- `frontend/app/polls/page.js`

How it works:

- Secretariat or admin creates a poll
- Staff votes once
- Results are shown with simple bars
- Vote restriction is enforced with the `Vote` collection

The vote rule is kept simple with a unique index on:

- `user`
- `poll`

## 10. Analytics dashboard

The analytics page is:

- `frontend/app/analytics/page.js`

The backend analytics route is:

- `GET /analytics`

The analytics page shows:

- Complaints by department
- Case count by category
- Case count by status
- Hot spot alerts for 5 or more complaints from the same department and category

## 11. Escalation logic

The escalation logic is handled in:

- `backend/src/utils/processEscalations.js`
- `backend/src/scripts/runEscalation.js`

How it works:

- Complaint is assigned to a case manager
- If there is no case manager action within 7 days
- System marks the reminder time
- System changes status to `Escalated`
- System adds a note in the complaint timeline

The server also runs a daily cron job from `backend/src/server.js`.

## 12. README instructions

To start the backend, first install packages inside the backend folder.

```bash
cd backend
npm install
```

Then create the environment file from the example.

```bash
cp .env.example .env
```

Then start the backend server.

```bash
npm run dev
```

To start the frontend, first install packages inside the frontend folder.

```bash
cd ../frontend
npm install
```

Then create the frontend environment file from the example.

```bash
cp .env.local.example .env.local
```

Then start the frontend app.

```bash
npm run dev
```

If you want to run only the escalation job manually, use this command in the backend folder.

```bash
npm run escalate
```

## Main pages

These are the main frontend routes already created:

- `/login`
- `/dashboard`
- `/dashboard/staff`
- `/dashboard/secretariat`
- `/dashboard/case-manager`
- `/dashboard/admin`
- `/submit-complaint`
- `/cases`
- `/case/[id]`
- `/polls`
- `/public-hub`
- `/analytics`

## Notes for demo

These are a few useful demo notes:

- The code is beginner-friendly, so it avoids heavy abstractions.
- File uploads are saved in `backend/uploads`.
- Meeting minutes are public through the public hub.
- Admin gets a small user management and settings area.
- Example document shapes are in `backend/src/data/exampleDocuments.js`.
