import JSZip from 'jszip';
import type { ArticleData } from '../types';

const sanitizeFilename = (name: string) => {
  return name.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
};

/**
 * Exports the article as an EPUB file.
 * @param article The article data object.
 */
export const exportArticleAsEpub = async (article: ArticleData) => {
  try {
    const zip = new JSZip();
    const title = article.query;
    const cleanTitle = sanitizeFilename(title);

    // 1. Create mimetype file
    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

    // 2. Create META-INF/container.xml
    const containerXML = `<?xml version="1.0" encoding="UTF-8" ?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
    zip.folder("META-INF")?.file("container.xml", containerXML);

    // 3. Prepare content and create OEBPS folder
    const oebps = zip.folder("OEBPS");

    // Clean up HTML content for EPUB
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article.content;
    
    // Remove unwanted elements
    tempDiv.querySelectorAll('.mw-editsection, .reflist, #toc, .navbox, .metadata, .catlinks').forEach(el => el.remove());
    
    // Basic styles for the EPUB
    const css = `
body { font-family: serif; line-height: 1.5; }
h1, h2, h3 { font-family: sans-serif; }
img { max-width: 100%; height: auto; }
.infobox, .thumb { border: 1px solid #ccc; background-color: #f9f9f9; padding: 1em; margin: 1em 0; font-size: 0.9em; }
    `;
    oebps?.file("style.css", css);

    const contentXHTML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>${title}</title>
  <link rel="stylesheet" type="text/css" href="style.css" />
</head>
<body>
  <h1>${title}</h1>
  ${tempDiv.innerHTML}
</body>
</html>`;
    oebps?.file("content.xhtml", contentXHTML);

    // 4. Create content.opf file (the "manifest")
    const contentOPF = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="pub-id" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${title}</dc:title>
    <dc:creator>Grokipedia</dc:creator>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString()}</meta>
  </metadata>
  <manifest>
    <item id="content" href="content.xhtml" media-type="application/xhtml+xml" />
    <item id="css" href="style.css" media-type="text/css" />
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml" />
  </manifest>
  <spine toc="ncx">
    <itemref idref="content" />
  </spine>
</package>`;
    oebps?.file("content.opf", contentOPF);

    // 5. Create toc.ncx (Table of Contents)
    const tocNCX = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${crypto.randomUUID()}" />
    <meta name="dtb:depth" content="1" />
    <meta name="dtb:totalPageCount" content="0" />
    <meta name="dtb:maxPageNumber" content="0" />
  </head>
  <docTitle>
    <text>${title}</text>
  </docTitle>
  <navMap>
    <navPoint id="navpoint-1" playOrder="1">
      <navLabel>
        <text>${title}</text>
      </navLabel>
      <content src="content.xhtml"/>
    </navPoint>
  </navMap>
</ncx>`;
    oebps?.file("toc.ncx", tocNCX);

    // 6. Generate the EPUB file and trigger download
    const blob = await zip.generateAsync({
      type: "blob",
      mimeType: "application/epub+zip",
      compression: "DEFLATE"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${cleanTitle}.epub`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

  } catch (error) {
    console.error("Failed to generate EPUB:", error);
    throw new Error("EPUB generation failed. Please try again.");
  }
};