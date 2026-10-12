/* Option lists for dropdowns. Dummy data for now; the backend will supply these later.
   Use lookup(name) to get a copy of a list. Names are dotted: group.item */
window.LOOKUPS={
  'gdmt.arni':['Sacubitril-valsartan','Entresto'],
  'gdmt.bb':['Metoprolol succinate','Carvedilol'],
  'gdmt.mra':['Spironolactone','Eplerenone'],
  'gdmt.sg':['Dapagliflozin','Empagliflozin'],
  'gdmt.dose.arni':['24/26 mg twice daily','49/51 mg twice daily','97/103 mg twice daily'],
  'gdmt.dose.bb':['12.5 mg daily','25 mg daily','50 mg daily','100 mg daily'],
  'gdmt.dose.mra':['12.5 mg daily','25 mg daily','50 mg daily'],
  'gdmt.dose.sg':['5 mg daily','10 mg daily'],
  'gdmt.status':['Active','Not started','Stopped'],
  'patient.sex':['Male','Female'],
  'patient.etiology':['Ischemic','Non-ischemic','Other']
};
window.lookup=function(name){return (window.LOOKUPS&&window.LOOKUPS[name])?window.LOOKUPS[name].slice():[]};
