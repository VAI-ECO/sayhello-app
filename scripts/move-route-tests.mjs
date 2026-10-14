// Mechanical relocation only: preserve tests/assertions; rewrite relative module imports.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const root = path.resolve(import.meta.dirname, '..');
const app = path.join(root, 'app');
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const sources = walk(app).filter(file=>file.includes('/__tests__/'));
const targets = new Map(sources.map(file=>[file,path.join(root,'route-tests',path.relative(app,file))]));
for(const [oldFile,newFile] of targets){
  if(fs.existsSync(newFile)) throw new Error(`Refusing to overwrite ${newFile}`);
  const source=fs.readFileSync(oldFile,'utf8');
  const tree=ts.createSourceFile(oldFile,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const edits=[];
  const moduleCall = node => ts.isIdentifier(node)&&node.text==='require'||ts.isPropertyAccessExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==='jest'&&['mock','unmock','doMock','requireActual','requireMock'].includes(node.name.text);
  function visit(node){
    let spec;
    if(ts.isImportDeclaration(node)||ts.isExportDeclaration(node)) spec=node.moduleSpecifier;
    else if(ts.isCallExpression(node)&&moduleCall(node.expression)) spec=node.arguments[0];
    if(spec&&ts.isStringLiteral(spec)&&spec.text.startsWith('.')){
      const absolute=path.resolve(path.dirname(oldFile),spec.text);
      const target=targets.get(absolute)||absolute;
      let relative=path.relative(path.dirname(newFile),target).split(path.sep).join('/');
      if(!relative.startsWith('.')) relative='./'+relative;
      edits.push({start:spec.getStart(tree)+1,end:spec.getEnd()-1,text:relative});
    }
    ts.forEachChild(node,visit);
  }
  visit(tree);
  let output=source;
  for(const edit of edits.sort((a,b)=>b.start-a.start)) output=output.slice(0,edit.start)+edit.text+output.slice(edit.end);
  fs.mkdirSync(path.dirname(newFile),{recursive:true});
  fs.renameSync(oldFile,newFile);
  fs.writeFileSync(newFile,output);
  console.log(`${path.relative(root,oldFile)} -> ${path.relative(root,newFile)} (${edits.length} module references)`);
}
