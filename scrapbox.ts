// Minimal Scrapbox REST API client for page import/export.
// Ref: https://scrapbox.io/help-jp/API

const SCRAPBOX_HOST = "scrapbox.io";

const cookie = (sid: string) => `connect.sid=${sid}`;

/** Fetch CSRF token from the Scrapbox user profile API. */
const getCSRFToken = async (sid: string): Promise<string> => {
  const res = await fetch(`https://${SCRAPBOX_HOST}/api/users/me`, {
    headers: { Cookie: cookie(sid) },
  });
  if (!res.ok) {
    throw new Error(
      `Failed to get CSRF token: ${res.status} ${res.statusText}`,
    );
  }
  const user = await res.json();
  return user.csrfToken;
};

/** Import pages into a project via POST /api/page-data/import/{project}.json */
export const importPages = async (
  project: string,
  // deno-lint-ignore no-explicit-any
  data: { pages: any[] },
  init: { sid: string },
): Promise<{ ok: true; value: string } | { ok: false; value: Error }> => {
  if (data.pages.length === 0) {
    return { ok: true, value: "No pages to import." };
  }

  const csrf = await getCSRFToken(init.sid);
  const formData = new FormData();
  formData.append(
    "import-file",
    new Blob([JSON.stringify(data)], { type: "application/octet-stream" }),
  );
  formData.append("name", "undefined");

  const res = await fetch(
    `https://${SCRAPBOX_HOST}/api/page-data/import/${project}.json`,
    {
      method: "POST",
      headers: {
        Cookie: cookie(init.sid),
        Accept: "application/json, text/plain, */*",
        "X-CSRF-TOKEN": csrf,
      },
      body: formData,
    },
  );

  if (!res.ok) {
    const text = await res.text();
    return {
      ok: false,
      value: new Error(`Import failed: ${res.status} ${text}`),
    };
  }

  const { message } = await res.json();
  return { ok: true, value: message };
};

/** Export all pages from a project via GET /api/page-data/export/{project}.json */
export const exportPages = async (
  project: string,
  init: { sid: string; metadata: boolean },
): Promise<
  // deno-lint-ignore no-explicit-any
  { ok: true; value: any } | { ok: false; value: Error }
> => {
  const res = await fetch(
    `https://${SCRAPBOX_HOST}/api/page-data/export/${project}.json?metadata=${init.metadata}`,
    { headers: { Cookie: cookie(init.sid) } },
  );

  if (!res.ok) {
    const text = await res.text();
    return {
      ok: false,
      value: new Error(`Export failed: ${res.status} ${text}`),
    };
  }

  return { ok: true, value: await res.json() };
};
