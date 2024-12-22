"use strict";

/**
 * @typedef {string} UserApiDescription
 */

/**
 * @type {string}
 */
export const UserImportDescription: string = `Import multiple users from CSV, XLSX, or XLS file.

**Supported File Formats:**
- CSV (.csv)
- Excel (.xlsx)
- Excel 97-2003 (.xls)

**Required Columns:**
- \`name\` - User's full name
- \`email\` - User's email address (must be unique)
- \`password\` - User's password (will be hashed automatically)

**CSV Example:**
\`\`\`csv
name,email,password
John Doe,john@example.com,password123
Jane Smith,jane@example.com,securepass456
Bob Wilson,bob@example.com,mypassword789
\`\`\`

**Excel Example:**
| name | email | password |
|------|-------|----------|
| John Doe | john@example.com | password123 |
| Jane Smith | jane@example.com | securepass456 |

**Notes:**
- Duplicate emails will be skipped
- Empty rows will be skipped
- Import is processed asynchronously
- You will receive a notification when import is complete`;

/**
 * @type {string}
 */
export const UserExportDescription: string = `Export all active users to CSV, XLSX, or XLS file.

**Supported Export Formats:**
- CSV (.csv) - Comma-separated values
- Excel (.xlsx) - Modern Excel format
- Excel 97-2003 (.xls) - Legacy Excel format

**Exported Data Includes:**
- User ID
- Name
- Email
- Email Verified At
- Created At
- Updated At

**Process:**
1. Request export with desired format
2. Export is processed asynchronously in the background
3. Receive notification when export is ready
4. Download file from notification link

**Example Output (CSV):**
\`\`\`csv
id,name,email,email_verified_at,created_at,updated_at
01KEF...,John Doe,john@example.com,2026-01-09T10:30:00,2026-01-08T15:20:00,2026-01-09T10:30:00
01KEG...,Jane Smith,jane@example.com,2026-01-09T11:15:00,2026-01-08T16:45:00,2026-01-09T11:15:00
\`\`\``;
