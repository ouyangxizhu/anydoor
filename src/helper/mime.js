const path = require('path');
const mimeTypes = {
    'css': 'text/css',
    'txt': 'text/plain',
    'xml': 'text/xml',
    'html': 'text/html',
    'js': 'text/javascript',
    'json':'application/json',
    'pdf':'application/pdf',
    'gif':'image/gif',
    'ico':'image/x-icon',
    'jpeg':'image/jpeg',
    'jpg':'image/jpeg',
    'gif':'image/gif',
    'png':'image/png',
    'tiff':'image/tiff',
    'svg':'image/svg+xml'
}
module.exports = (filePath)=>{
    let ext = path.extname(filePath)
        .split('.')
        .pop()
        .toLowerCase();
    if(!ext){
        ext = filePath;
    }
    return mimeTypes[ext] || mimeTypes['txt'];
}