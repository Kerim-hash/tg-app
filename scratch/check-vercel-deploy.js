async function check() {
  const pageUrl = `https://tg-app-ri5g.vercel.app/?t=${Date.now()}`;
  console.log("Fetching page:", pageUrl);
  
  try {
    const pageRes = await fetch(pageUrl, { headers: { 'Cache-Control': 'no-cache' } });
    const html = await pageRes.text();
    
    // Find all script tags
    const scriptRegex = /src="(\/_next\/static\/chunks\/[^"]+\.js)"/g;
    let match;
    const scripts = [];
    while ((match = scriptRegex.exec(html)) !== null) {
      scripts.push(match[1]);
    }
    
    console.log("Found scripts:", scripts);
    
    const searchToken = "8963890590";
    let found = false;
    
    for (const src of scripts) {
      const scriptUrl = `https://tg-app-ri5g.vercel.app${src}`;
      console.log("Checking script:", scriptUrl);
      const res = await fetch(scriptUrl);
      const js = await res.text();
      
      if (js.includes(searchToken)) {
        console.log(`✅ FOUND TOKEN ${searchToken} IN SCRIPT: ${scriptUrl}`);
        found = true;
      }
      if (js.includes("WebAppData")) {
        console.log(`✅ FOUND "WebAppData" IN SCRIPT: ${scriptUrl}`);
      }
    }
    
    if (!found) {
      console.log(`❌ TOKEN ${searchToken} NOT FOUND IN ANY DEPLOYED JS CHUNKS! This means Vercel has not deployed our changes yet.`);
    }
  } catch (err) {
    console.error("Error checking deployment:", err);
  }
}

check();
