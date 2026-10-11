/* Option lists for dropdowns. Dummy data for now; the backend will supply these later.
   Use lookup(name) to get a copy of a list. Names are dotted: group.item */
window.LOOKUPS={
  'gdmt.arni':['Sacubitril-valsartan','Entresto'],
  'gdmt.bb':['Metoprolol succinate','Carvedilol'],
  'gdmt.mra':['Spironolactone','Eplerenone'],
  'gdmt.sg':['Dapagliflozin','Empagliflozin'],
  'gdmt.status':['Active','Not started','Stopped'],
  'patient.sex':['Male','Female'],
  'patient.etiology':['Ischemic','Non-ischemic','Other']
};
window.lookup=function(name){return (window.LOOKUPS&&window.LOOKUPS[name])?window.LOOKUPS[name].slice():[]};
