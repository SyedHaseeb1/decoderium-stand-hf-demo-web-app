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

/* =========================================================
   Master Curated Lists for Standardization (Prevents Data Fragmentation)
   Ensures cities, zones, and titles are spelled identically across the registry.
   ========================================================= */
window.PAKISTAN_CITIES = [
  'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Sukkur',
  'Bahawalpur', 'Sargodha', 'Abbottabad', 'Mardan', 'Mirpur', 'Muzaffarabad',
  'Larkana', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Gujrat', 'Kasur',
  'Dera Ghazi Khan', 'Sahiwal', 'Nawabshah', 'Mingora', 'Chiniot', 'Kamoke',
  'Hafizabad', 'Kohat', 'Khanewal', 'Dera Ismail Khan', 'Turbat', 'Khuzdar',
  'Hub', 'Gwadar', 'Attock', 'Wah Cantt', 'Taxila'
];

window.PAKISTAN_ZONES = [
  'North', 'Central', 'South',
  'Lahore Central Zone', 'Lahore North Zone', 'Lahore South Zone', 'Lahore East Zone', 'Lahore West Zone',
  'Karachi Central Zone', 'Karachi South Zone', 'Karachi East Zone', 'Karachi West Zone', 'Karachi Malir Zone', 'Karachi Korangi Zone',
  'Rawalpindi Division Zone', 'Islamabad Capital Territory Zone',
  'Faisalabad Central Zone', 'Faisalabad Division Zone',
  'Multan City Zone', 'Multan Division Zone',
  'Peshawar Valley Zone', 'Peshawar Urban Zone',
  'Quetta Urban Zone', 'Quetta Division Zone',
  'Gujranwala Division Zone', 'Sialkot Industrial Zone', 'Gujrat Zone',
  'Hyderabad Region Zone', 'Sukkur Division Zone', 'Larkana Division Zone',
  'Bahawalpur Division Zone', 'Sargodha Division Zone', 'Sahiwal Division Zone',
  'Dera Ghazi Khan Division Zone', 'Dera Ismail Khan Zone',
  'Hazara Division Zone (Abbottabad)', 'Mardan Division Zone', 'Malakand Zone (Swat)',
  'Kohat Division Zone', 'Bannu Division Zone',
  'Shaheed Benazirabad Zone (Nawabshah)', 'Mirpurkhas Division Zone',
  'Makran Coastal Zone (Gwadar/Turbat)', 'Kalat Division Zone (Khuzdar)',
  'Nasirabad Division Zone', 'Zhob Division Zone',
  'Mirpur Division Zone (AJK)', 'Muzaffarabad Division Zone (AJK)', 'Poonch Division Zone (AJK)',
  'Gilgit Division Zone', 'Baltistan Division Zone (Skardu)', 'Diamer-Astore Zone'
];

window.CLINICAL_DESIGNATIONS = [
  'Consultant Cardiologist',
  'Associate Professor of Cardiology',
  'Assistant Professor of Cardiology',
  'Professor of Cardiology',
  'Fellow Interventional Cardiology',
  'Senior Registrar Cardiology',
  'Resident Medical Officer',
  'Clinical Research Coordinator',
  'Study Coordinator',
  'Medical Officer'
];

window.CITY_ALIASES = {
  'lhr': 'Lahore',
  'khi': 'Karachi',
  'isb': 'Islamabad',
  'rwp': 'Rawalpindi',
  'fsd': 'Faisalabad',
  'mux': 'Multan',
  'pew': 'Peshawar',
  'qta': 'Quetta',
  'skt': 'Sialkot',
  'ryk': 'Rahim Yar Khan',
  'hyd': 'Hyderabad',
  'bwp': 'Bahawalpur',
  'gwd': 'Gwadar',
  'skp': 'Sheikhupura'
};

window.ZONE_ALIASES = {
  'n': 'North',
  'north': 'North',
  'north zone': 'North',
  'c': 'Central',
  'central': 'Central',
  'central zone': 'Central',
  's': 'South',
  'south': 'South',
  'south zone': 'South',
  'lhr': 'Lahore Central Zone',
  'lahore': 'Lahore Central Zone',
  'khi': 'Karachi Central Zone',
  'karachi': 'Karachi Central Zone',
  'isb': 'Islamabad Capital Territory Zone',
  'islamabad': 'Islamabad Capital Territory Zone',
  'rwp': 'Rawalpindi Division Zone',
  'rawalpindi': 'Rawalpindi Division Zone',
  'fsd': 'Faisalabad Central Zone',
  'mux': 'Multan City Zone',
  'pew': 'Peshawar Valley Zone',
  'qta': 'Quetta Urban Zone'
};

window.DESIG_ALIASES = {
  'cc': 'Consultant Cardiologist',
  'cardiologist': 'Consultant Cardiologist',
  'crc': 'Clinical Research Coordinator',
  'coordinator': 'Study Coordinator',
  'sc': 'Study Coordinator',
  'mo': 'Medical Officer',
  'rmo': 'Resident Medical Officer',
  'sr': 'Senior Registrar Cardiology',
  'ap': 'Associate Professor of Cardiology',
  'prof': 'Professor of Cardiology'
};

window.normalizeCity = function(name){
  if(!name) return '';
  var trim = String(name).trim();
  var lo = trim.toLowerCase();
  if(window.CITY_ALIASES[lo]) return window.CITY_ALIASES[lo];
  var found = window.PAKISTAN_CITIES.find(function(c){
    return c.toLowerCase() === lo;
  });
  return found || (trim.charAt(0).toUpperCase() + trim.slice(1));
};

window.normalizeZone = function(zone){
  if(!zone) return 'Central';
  var trim = String(zone).trim();
  var lo = trim.toLowerCase();
  if(window.ZONE_ALIASES[lo]) return window.ZONE_ALIASES[lo];
  var found = window.PAKISTAN_ZONES.find(function(z){
    return z.toLowerCase() === lo;
  });
  return found || (trim.charAt(0).toUpperCase() + trim.slice(1));
};

window.normalizeDesignation = function(d){
  if(!d) return '';
  var trim = String(d).trim();
  var lo = trim.toLowerCase();
  if(window.DESIG_ALIASES[lo]) return window.DESIG_ALIASES[lo];
  var found = window.CLINICAL_DESIGNATIONS.find(function(item){
    return item.toLowerCase() === lo;
  });
  return found || trim;
};
