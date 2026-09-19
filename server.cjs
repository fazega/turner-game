const http=require('http'),fs=require('fs'),path=require('path');const root=__dirname;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.gltf':'model/gltf+json','.glb':'model/gltf-binary','.bin':'application/octet-stream','.json':'application/json'};
http.createServer((req,res)=>{let p;try{const url=new URL(req.url,'http://localhost');p=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname))}catch{res.writeHead(400);return res.end()}
 if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 fs.stat(p,(err,stat)=>{if(err||!stat.isFile()){res.writeHead(404);return res.end('Not found')}
  const etag='"'+stat.size.toString(16)+'-'+Math.floor(stat.mtimeMs).toString(16)+'"';res.setHeader('ETag',etag);res.setHeader('Cache-Control','public, max-age=0, must-revalidate');res.setHeader('Content-Type',mime[path.extname(p)]||'application/octet-stream');res.setHeader('Vary','Accept-Encoding');
  if(req.headers['if-none-match']===etag){res.writeHead(304);return res.end()}
  const send=(file,encoding)=>{if(encoding)res.setHeader('Content-Encoding',encoding);if(req.method==='HEAD')return res.end();const stream=fs.createReadStream(file);stream.on('error',()=>res.destroy());stream.pipe(res)};
  if((req.headers['accept-encoding']||'').includes('br'))fs.stat(p+'.br',(e,compressed)=>{if(!e&&compressed.mtimeMs>=stat.mtimeMs)send(p+'.br','br');else send(p)});else send(p);
 });
}).listen(8765,'127.0.0.1',()=>console.log('Harbour: http://127.0.0.1:8765'));
