const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const promisify = require('util').promisify;
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

const mime = require('./mime');
const compress = require('./compress');
const range = require('./range');
const isFresh = require('./cahe');

const tplPath = path.join(__dirname, '../template/dir.tpl');
const source = fs.readFileSync(tplPath);
const template = Handlebars.compile(source.toString());

module.exports = async function(req, res, filePath, config){
    try{
        const stats = await stat(filePath);
        const dir = path.relative(config.root, filePath);
        console.info('dir: ',dir);
        const contentType = mime(filePath);
        if (stats.isFile()) {
            
            res.setHeader('Contengt-Type', contentType);

            if(isFresh(stats, req, res)){
                res.statusCode = 304;
                res.end();
                return;
            }

            let rs;
            const{code, start, end} = range(stats.size, req, res);
            if(code == 200){
                res.statusCode = 200;
                rs = fs.createReadStream(filePath);
            }else{
                //当属性名和属性内容一样时，可以将：和属性内容忽略
                rs = fs.createReadStream(filePath, {start, end});
                res.statusCode = 206;
            }

            if (filePath.match(config.compress)) {
                rs = compress(rs, req, res)
            }
            rs.pipe(res);
        }else if (stats.isDirectory()) {
            const files = await readdir(filePath);
            res.statusCode = 200;
            res.setHeader('Contengt-Type', contentType);
            
            console.info('config.root:', config.root);
            console.info('filepath: ', filePath);

            const data = {
                title: path.basename(filePath),
                dir:dir ?`/${dir}`: '',
                files//和files同名不用写
            }

            res.end(template(data));
            
        }

    }catch(ex){
        console.error(ex);
        res.statusCode = 404;
        res.setHeader('Contengt-Type', contentType);
        res.end(`${filePath} is not exist!`);
    }
    
    // res.statusCode = 200;
    // res.setHeader('Content-Type', 'text/plain');
    // res.write('Hello World');
    // res.end(filePath);

}