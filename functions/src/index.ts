import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();
const SESSION_DURATION_DAYS = 90; // 3 months

// Helper to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

// HTML template for the Kobo page
function renderPage(title: string, content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} - Send2Kobo</title>
<style>
body {
  font-family: Georgia, serif;
  font-size: 18px;
  line-height: 1.5;
  margin: 0;
  padding: 16px;
  background: #fff;
  color: #000;
}
h1 {
  font-size: 24px;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #000;
}
h2 {
  font-size: 20px;
  margin: 24px 0 12px 0;
}
p {
  margin: 8px 0;
}
a {
  color: #000;
}
form {
  margin: 16px 0;
}
label {
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
}
input[type="text"] {
  width: 100%;
  max-width: 300px;
  padding: 12px;
  font-size: 24px;
  font-family: monospace;
  border: 3px solid #000;
  text-transform: uppercase;
  letter-spacing: 4px;
  box-sizing: border-box;
}
input[type="submit"], .btn {
  display: inline-block;
  padding: 12px 24px;
  font-size: 18px;
  font-weight: bold;
  background: #000;
  color: #fff;
  border: 3px solid #000;
  cursor: pointer;
  text-decoration: none;
  margin-top: 12px;
}
.file-item {
  padding: 16px;
  border: 2px solid #000;
  margin-bottom: 12px;
  background: #fff;
}
.file-name {
  font-weight: bold;
  word-break: break-all;
}
.file-size {
  font-size: 14px;
  margin-top: 4px;
}
.file-ext {
  display: inline-block;
  font-family: monospace;
  font-size: 12px;
  font-weight: bold;
  background: #000;
  color: #fff;
  padding: 4px 8px;
  margin-bottom: 8px;
}
.error {
  padding: 12px;
  border: 3px solid #000;
  font-weight: bold;
  margin: 16px 0;
}
.empty {
  padding: 24px;
  text-align: center;
  border: 2px dashed #000;
}
.footer {
  margin-top: 24px;
  padding-top: 12px;
  border-top: 2px solid #000;
  font-size: 14px;
}
</style>
</head>
<body>
${content}
<div class="footer">
  <a href="/kobo">Send2Kobo</a> - Made by <a href="https://github.com/wasita">wasita</a>
</div>
</body>
</html>`;
}

// Download proxy for small files - forces correct filename via Content-Disposition header
// Only used for files under 50MB to avoid timeouts
export const download = functions.runWith({ timeoutSeconds: 300, memory: "512MB" }).https.onRequest(async (req, res) => {
  const fileId = req.query.id as string;

  if (!fileId) {
    res.status(400).send("Missing file ID");
    return;
  }

  try {
    const fileDoc = await db.collection("files").doc(fileId).get();

    if (!fileDoc.exists) {
      res.status(404).send("File not found");
      return;
    }

    const file = fileDoc.data()!;
    const filename = file.name;
    const downloadUrl = file.downloadUrl;

    // Fetch the file from Firebase Storage
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      res.status(500).send("Failed to fetch file from storage");
      return;
    }

    // Set headers to force the correct filename
    const safeFilename = filename.replace(/[^\x20-\x7E]/g, "_");
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
    res.setHeader("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");

    const contentLength = response.headers.get("Content-Length");
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    // Stream the response body directly to the client
    if (response.body) {
      const reader = response.body.getReader();
      const push = async () => {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          return;
        }
        res.write(Buffer.from(value));
        await push();
      };
      await push();
    } else {
      // Fallback for environments without streaming
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).send("Download failed: " + (error as Error).message);
  }
});

// Main Kobo page - shows code entry form or file list
export const kobo = functions.https.onRequest(async (req, res) => {
  // Get code and strip any hyphens, spaces, or other non-alphanumeric chars
  const rawCode = (req.query.code as string || req.body?.code || "");
  const code = rawCode.toUpperCase().replace(/[^A-Z0-9]/g, "").trim();

  // If no code, show the entry form
  if (!code) {
    const html = renderPage("Download Files", `
<h1>Send2Kobo</h1>
<p>Enter the code shown on your computer to download files.</p>
<form method="GET" action="/kobo">
  <label for="code">Pairing Code:</label>
  <input type="text" id="code" name="code" maxlength="7" placeholder="ABC-123" required>
  <p style="font-size: 14px; margin-top: 4px;">Type with or without the hyphen</p>
  <input type="submit" value="Connect">
</form>
    `);
    res.send(html);
    return;
  }

  // Validate code format (after stripping non-alphanumeric)
  if (code.length !== 6 || !/^[A-Z0-9]+$/.test(code)) {
    const html = renderPage("Error", `
<h1>Send2Kobo</h1>
<div class="error">Invalid code format. Please enter a 6-character code (e.g. ABC123 or ABC-123).</div>
<p><a href="/kobo" class="btn">Try Again</a></p>
    `);
    res.send(html);
    return;
  }

  try {
    // Look up session by code
    const sessionsRef = db.collection("sessions");
    const sessionQuery = await sessionsRef.where("code", "==", code).get();

    if (sessionQuery.empty) {
      const html = renderPage("Not Found", `
<h1>Send2Kobo</h1>
<div class="error">Code not found or expired. Please check the code and try again.</div>
<p><a href="/kobo" class="btn">Try Again</a></p>
      `);
      res.send(html);
      return;
    }

    const sessionDoc = sessionQuery.docs[0];
    const sessionData = sessionDoc.data();

    // Check if expired - if so, extend the session
    const expiresAt = sessionData.expiresAt.toDate();
    if (expiresAt < new Date()) {
      const newExpiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);
      await sessionDoc.ref.update({
        expiresAt: admin.firestore.Timestamp.fromDate(newExpiresAt),
      });
    }

    // Get files for this session
    const filesRef = db.collection("files");
    const filesQuery = await filesRef
      .where("sessionId", "==", sessionDoc.id)
      .orderBy("uploadedAt", "desc")
      .get();

    let fileListHtml = "";

    if (filesQuery.empty) {
      fileListHtml = `<div class="empty">No files uploaded yet. Upload files from your computer first.</div>`;
    } else {
      const MAX_PROXY_SIZE = 50 * 1024 * 1024; // 50MB threshold

      filesQuery.docs.forEach((doc) => {
        const file = doc.data();
        const ext = file.name.split(".").pop()?.toUpperCase() || "FILE";
        const isLargeFile = file.size > MAX_PROXY_SIZE;

        // Use proxy for small files (correct filename), direct URL for large files (faster)
        const downloadUrl = isLargeFile ? file.downloadUrl : `/download?id=${doc.id}`;
        const sizeNote = isLargeFile
          ? `<p style="font-size: 12px; margin-top: 8px;">Large file - will save with a long name.</p>`
          : "";

        fileListHtml += `
<div class="file-item">
  <span class="file-ext">${ext}</span>
  <div class="file-name">${file.name}</div>
  <div class="file-size">${formatFileSize(file.size)}</div>
  <a href="${downloadUrl}" class="btn">Download</a>
  ${sizeNote}
</div>`;
      });
    }

    const html = renderPage("Files", `
<h1>Send2Kobo</h1>
<p>Connected: <strong>${code.substring(0, 3)}-${code.substring(3, 6)}</strong></p>
<p><a href="/kobo">Disconnect</a> | <a href="/kobo?code=${code}">Refresh</a></p>

<h2>Available Files</h2>
${fileListHtml}
    `);

    res.send(html);
  } catch (error) {
    console.error("Error:", error);
    const html = renderPage("Error", `
<h1>Send2Kobo</h1>
<div class="error">Something went wrong. Please try again.</div>
<p><a href="/kobo" class="btn">Try Again</a></p>
    `);
    res.send(html);
  }
});
