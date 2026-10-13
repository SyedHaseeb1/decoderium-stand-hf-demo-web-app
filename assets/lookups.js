/* Option lists for dropdowns. Dummy data for now; the backend will supply these later.
   Use lookup(name) to get a copy of a list. Names are dotted: group.item */
window.LOOKUPS={
  /* GDMT drugs per pillar, from the E-CRF form (section C) */
  'gdmt.arni':['Sacubitril Valsartan'],
  'gdmt.bb':['Bisoprolol fumarate','Carvedilol','Nebivolol'],
  'gdmt.mra':['Spironolactone','Eplerenone','Finerenone'],
  'gdmt.sg':['Dapagliflozin','Empagliflozin','Sotagliflozin'],
  'gdmt.frequency':['OD','BD','TDS'],
  'gdmt.status':['Active','Not started','Stopped'],
  'patient.sex':['Male','Female'],
  'patient.etiology':['Ischemic','Non-ischemic','Other']
};

/* GDMT strengths per generic drug (E-CRF changes specification) */
window.GDMT_STRENGTHS={
  'Sacubitril Valsartan':['25mg','50mg','100mg','200mg'],
  'Sacubitril + Valsartan':['25mg','50mg','100mg','200mg'],
  'Bisoprolol fumarate':['2.5mg','5mg','10mg'],
  'Carvedilol':['3.125mg','6.25mg','12.5mg','25mg'],
  'Nebivolol':['1.5mg','2.5mg','5mg','10mg'],
  'Spironolactone':['12.5mg','25mg','50mg'],
  'Eplerenone':['25mg','50mg'],
  'Finerenone':['10mg','20mg','40mg'],
  'Dapagliflozin':['10mg'],
  'Empagliflozin':['10mg'],
  'Sotagliflozin':['200mg','400mg']
};

/* Recommended default frequencies per drug (OD for most, BD for Carvedilol & Sacubitril Valsartan) */
window.GDMT_DEFAULT_FREQ={
  'Carvedilol':'BD',
  'Sacubitril Valsartan':'BD',
  'Sacubitril + Valsartan':'BD',
  'Bisoprolol fumarate':'OD',
  'Nebivolol':'OD',
  'Spironolactone':'OD',
  'Eplerenone':'OD',
  'Finerenone':'OD',
  'Dapagliflozin':'OD',
  'Empagliflozin':'OD',
  'Sotagliflozin':'OD'
};

/* Legacy dose list retained for backward compatibility with existing saved patient objects */
window.GDMT_DOSES={
  'Sacubitril Valsartan':['25mg','50mg','100mg','200mg'],
  'Sacubitril + Valsartan':['25mg','50mg','100mg','200mg'],
  'Bisoprolol fumarate':['2.5mg','5mg','10mg'],
  'Carvedilol':['3.125mg','6.25mg','12.5mg','25mg'],
  'Nebivolol':['1.5mg','2.5mg','5mg','10mg'],
  'Spironolactone':['12.5mg','25mg','50mg'],
  'Eplerenone':['25mg','50mg'],
  'Finerenone':['10mg','20mg','40mg'],
  'Dapagliflozin':['10mg'],
  'Empagliflozin':['10mg'],
  'Sotagliflozin':['200mg','400mg']
};
window.lookup=function(name){return (window.LOOKUPS&&window.LOOKUPS[name])?window.LOOKUPS[name].slice():[]};
