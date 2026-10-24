import test from 'node:test'; import assert from 'node:assert/strict';
import {toCamelot,harmonicRelation} from '../src/camelot.js';
import {diffPercent,tempoMatch} from '../src/bpm.js';
import {findCompatible} from '../src/compat.js';
import {toCsv,safeCell} from '../src/csv.js';
test('Camelot conocidos',()=>{
  for(const [k,c] of [['C','8B'],['Am','8A'],['F♯m','11A'],['F#m','11A'],['Em','9A'],['B♭','6B'],['Bb','6B'],['A#m','3A'],['Dbm','12A'],['Gmaj','9B'],['Amin','8A']]) assert.equal(toCamelot(k),c,k);
});
test('Claves inválidas → null',()=>{for(const k of ['','H','xyz',null,undefined,42]) assert.equal(toCamelot(k),null);});
test('Armonía',()=>{
  assert.equal(harmonicRelation('8A','8A').id,'same'); assert.equal(harmonicRelation('8A','9A').id,'neighbor');
  assert.equal(harmonicRelation('1A','12A').id,'neighbor'); assert.equal(harmonicRelation('8A','8B').id,'relative');
  assert.equal(harmonicRelation('8A','10A').level,'flexible'); assert.equal(harmonicRelation('8A','3B').id,'none');
  assert.equal(harmonicRelation('x','8A'),null);
});
test('BPM',()=>{
  assert.equal(diffPercent(100,106),6); assert.equal(diffPercent(0,100),null); assert.equal(diffPercent(NaN,100),null);
  assert.equal(tempoMatch(128,64,2).mode,'double'); assert.equal(tempoMatch(128,140,4),null); assert.equal(tempoMatch(128,130,4).mode,'direct');
});
test('Compatibles: sin datos no se recomienda',()=>{
  const base={id:1,bpm:128,camelot:'8A'};
  const pool=[{id:2,bpm:130,camelot:'9A'},{id:3,bpm:null,camelot:'8A'},{id:4,bpm:128,camelot:null},{id:5,bpm:128,camelot:'10A'},{id:6,bpm:129,camelot:'3B'}];
  assert.deepEqual(findCompatible(base,pool,{range:4,strict:true}).map(r=>r.track.id),[2]);
  assert.deepEqual(findCompatible(base,pool,{range:4,strict:false}).map(r=>r.track.id).sort(),[2,5]);
});
test('CSV',()=>{
  const c=toCsv([{title:'A, "B"',artist:'Ñandú',bpm:128,camelot:'8A'},{title:'=HYPERLINK("x")',artist:'x'}]);
  assert.ok(c.startsWith('\uFEFF"Título"')); assert.ok(c.includes('"A, ""B"""')); assert.ok(c.includes('Ñandú'));
  assert.ok(c.includes('"\'=HYPERLINK')); assert.equal(safeCell(null),'""');
});
