const url = 'https://www.notion.so/api/v3/loadPageChunk';
const pageId = '2721d8dc-fa7e-80a9-9523-f03d0d658a5c';

async function fetchNotion() {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            page: { id: pageId },
            limit: 100,
            chunkNumber: 0,
            verticalColumns: false
        })
    });

    const data = await res.json();
    const blocks = data.recordMap.block;

    let textOut = '';
    for (const id in blocks) {
        const block = blocks[id].value;
        if (block && block.properties && block.properties.title) {
            textOut += block.properties.title.map(t => t[0]).join('') + '\n';
        }
    }

    console.log(textOut);
}

fetchNotion().catch(console.error);
