# CMS — Cascade CMS Assets

Velocity format templates and Data Definition exports for the UTSA Cascade CMS site.

---

## Files

### `sitemap-query.vm`

A Velocity format template that generates a standard XML sitemap (`<urlset>`) for the entire site.

**How it works:**

- Iterates over four metadata sets: `Page`, `Faculty Page`, `Blog Category`, and `Blog`.
- For each set it runs a CMS query scoped to the current site that:
  - Excludes blocks, folders, files, and symlinks (pages only).
  - Filters to indexable and publishable assets only.
  - Returns up to 9,001 results sorted by path ascending.
- Skips any page whose path contains `_cms` (internal/system pages).
- Outputs one `<url>` element per page containing:
  - `<loc>` — absolute URL built from the site URL + page path + `.html` extension.
  - `<priority>` — hardcoded to `1`.
  - `<lastmod>` — last published date formatted as `YYYY-MM-dd`.

**Dependencies:**

- `_cms/formats/global/utilities` (imported at the top — provides shared macros).
- Cascade Velocity globals: `$_`, `$_DateTool`, `$currentPage`, `$currentPageSiteName`, `$siteSetup`.

---

### `faculty-profile-query.vm`

A Velocity format template derived from `sitemap-query.vm` that exports an enriched XML feed of all Faculty Profile pages and their block-level structured data.

**How it works:**

- Runs a single query filtered to the `"Faculty Page"` metadata set only.
- Calls `.preloadStructuredData()` on the query so all structured data is fetched in one pass (no per-page round-trips).
- For each result page it:
  1. Skips paths containing `_cms`.
  2. Reads `page.metadata.displayName`.
  3. Determines publish status by checking `lastPublishedOn` — `published` if the date is non-empty, `unpublished` otherwise.
  4. Dereferences the faculty profile block attached to the page via the `block` asset-chooser field.
  5. Reads `details/title` (multiple, up to 5) from the block and joins them into a single comma-separated string.
  6. Reads `details/primaryDepartment` from the block.
- Outputs one flat `<facultyProfile>` element per page containing:
  - `<loc>` — absolute URL.
  - `<displayName>` — CDATA-wrapped page display name.
  - `<status>` — `published` or `unpublished`.
  - `<lastmod>` — last published date (`yyyy-MM-dd`), empty for unpublished pages.
  - `<title>` — CDATA-wrapped comma-separated titles from the block.
  - `<primaryDepartment>` — CDATA-wrapped primary department from the block.

**Sample output entry:**

```xml
<facultyProfile>
    <loc>https://example.utsa.edu/colleges/example/faculty/jane-doe.html</loc>
    <displayName><![CDATA[Jane Doe]]></displayName>
    <status>published</status>
    <lastmod>2026-06-13</lastmod>
    <title><![CDATA[Associate Professor, Graduate Advisor]]></title>
    <primaryDepartment><![CDATA[Department of Example]]></primaryDepartment>
</facultyProfile>
```

**Known edge cases / things to verify:**

| Item | Detail |
|---|---|
| `preloadStructuredData()` arg | Documented as no-arg; if your Cascade version requires a boolean, change to `.preloadStructuredData(true)`. |
| `$velocityCount` | Used for the title separator. If your Cascade version exposes this as `$foreach.count`, swap the variable. |
| Blockless pages | Pages with no block attached output empty `<title>` and `<primaryDepartment>`. Pages are not skipped — add an `#if ($block)` guard if you want to omit them. |
| `lastPublishedOn` type | Tested with `.isEmpty()`. If your version returns a Date object instead of a String, swap the check for `$_PropertyTool.isNull($rawPubDate)`. |

**Dependencies:**

- `_cms/formats/global/utilities`.
- Cascade Velocity globals: `$_`, `$_DateTool`, `$currentPage`, `$currentPageSiteName`, `$siteSetup`.

---

### `faculty-block-dd.xml`

Cascade CMS Data Definition export for the **Faculty Profile Block** — a reusable shared block asset.

**Field structure:**

| Identifier path | Label | Type | Notes |
|---|---|---|---|
| `details/title` | Title | Text | `multiple="true"`, min 1, max 5, required |
| `details/primaryDepartment` | Primary Department | Text | Required |
| `details/phone` | Phone | Text | e.g. `210-555-5555` |
| `details/email` | Email | Text | |
| `details/office` | Office Location | Text | e.g. `BB 4.01.18` |
| `details/wysiwyg` | About (only on cards) | Rich text (WYSIWYG) | Brief intro paragraph |
| `details/cvlink` | CV Link | Shared field (Link) | |
| `details/link` | Profile Page Link | Shared field (/Link) | |
| `image` | Headshot | Shared field (/Image) | Top-level, outside the `details` group |

The `faculty-profile-query.vm` template only reads `details/title` and `details/primaryDepartment` from this block.

---

### `faculty-profile-page-dd.xml`

Cascade CMS Data Definition export for the **Faculty Profile page** type.

**Field structure:**

| Identifier | Label | Type | Notes |
|---|---|---|---|
| `block` | Faculty Profile Block | Block asset chooser | Required — links to the Faculty Profile Block |
| `uuid` | UTSA Discovery UUID | Text | |
| `campusAddress` | Campus Address | Text | |
| `mailbox` | Mail | Text | |
| `faxNumber` | Fax | Text | |
| `links/linkCollegeSite` | College Site | Shared field (Link) | |
| `links/linkSchoolSite` | School Site | Shared field (Link) | |
| `links/link` | Additional Link | Shared field (Link) | Max 10 |
| `fullBio` | Full Bio | Rich text (WYSIWYG) | |
| `teaching` | Teaching | Rich text (WYSIWYG) | Recent courses taught |
| `researchInterests` | Research Interests | Rich text (WYSIWYG) | Bulleted list |
| `degrees` | Degrees | Rich text (WYSIWYG) | Bulleted list |
| `recentMediaClips/link` | (Media link) | Shared field (Link) | Max 50 |
| `awards/awardInfo` | Information from | Radio | `utsaDiscovery` / `wysiwyg` / `noAwardsInfo` |
| `awards/awardsCount` | (Count) | Shared field (utsaDiscoveryCount) | Default 500 |
| `awards/section` | (Section) | Shared field (Accordion) | |
| `presentations/presentationsInfo` | Information from | Radio | `utsaDiscovery` / `wysiwyg` / `noPresentationInfo` |
| `presentations/presentationsCount` | (Count) | Shared field (utsaDiscoveryCount) | Default 500 |
| `presentations/section` | (Section) | Shared field (Accordion) | |
| `grants/grantsInfo` | Information from | Radio | `utsaDiscovery` / `wysiwyg` / `noGrants` |
| `grants/grantsCount` | Grants count | Shared field (utsaDiscoveryCount) | Default 500 |
| `grants/patentsCount` | Patents count | Shared field (utsaDiscoveryCount) | Default 500 |
| `grants/clinicalTrialsCount` | Clinical Trials count | Shared field (utsaDiscoveryCount) | Default 500 |
| `grants/section` | (Section) | Shared field (Accordion) | |
| `publications/publicationInfo` | Information from | Radio | `utsaDiscovery` / `wysiwyg` / `noPublicationInfo` |
| `publications/publicationsCount` | (Count) | Shared field (utsaDiscoveryCount) | |
| `publications/section` | (Section) | Shared field (Accordion) | |

The `block` asset chooser (identifier `block`) is the critical linkage — `faculty-profile-query.vm` dereferences it as `$page.getStructuredDataNode("block").asset` to reach the Faculty Profile Block's fields.

---

### `cms-convo.md`

A logged conversation capturing the iterative development of `faculty-profile-query.vm` from the original `sitemap-query.vm`. Useful as a design record documenting:

- Why structured data preloading (`.preloadStructuredData()`) was used.
- How block dereferencing works via the asset-chooser field.
- The reasoning behind the publish-status check using `lastPublishedOn`.
- The decision to flatten the XML output and concatenate multiple titles into one string.

---

## Relationship Between Files

```
faculty-profile-page-dd.xml         ← Data Definition for the page
    └── block (asset chooser)
            │
            ▼
    faculty-block-dd.xml            ← Data Definition for the reusable block
            │
            ▼
    faculty-profile-query.vm        ← Reads both via Velocity/Cascade query API
            │
            ▼
    <facultyProfiles> XML output    ← Consumed externally (e.g. data feeds, audits)

sitemap-query.vm                    ← Separate format; generates standard XML sitemap
                                       across all four metadata set types
```
