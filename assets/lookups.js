/* GDMT drugs and dropdown lists, read from data/gdmt.json and data/clinical-options.json (loaded by assets/boot.js).
   Use lookup(name) to get a copy of a list. Names are dotted: group.item */
var GDMT_DATA=window.STANDHF_DATA.gdmt;
var CLINICAL_DATA=window.STANDHF_DATA.clinicalOptions;
var LOCATION_DATA=window.STANDHF_DATA.locationStandards;

/* Each drug is stored once in gdmt.json. The lists and the per-drug lookups below are built from it */
var GDMT_DRUGS=[].concat.apply([],GDMT_DATA.pillars.map(function(p){return p.drugs}));
var NAMES_OF=function(d){return [d.name].concat(d.aliases||[])};
window.LOOKUPS=Object.assign(
  Object.fromEntries(GDMT_DATA.pillars.map(function(p){return ['gdmt.'+p.key, p.drugs.map(function(d){return d.name})]})),
  {
    /* Dosing frequencies are standard clinical abbreviations, so they stay in code */
    'gdmt.frequency':['OD','BD','TDS'],
    'gdmt.status':GDMT_DATA.statuses,
    /* Sex is a fixed, well-known set, so it stays in code */
    'patient.sex':['Male','Female'],
    'patient.etiology':CLINICAL_DATA.etiologies
  }
);
window.GDMT_STRENGTHS=Object.fromEntries(GDMT_DRUGS.flatMap(function(d){return NAMES_OF(d).map(function(n){return [n,d.strengths]})}));
window.GDMT_DEFAULT_FREQ=Object.fromEntries(GDMT_DRUGS.flatMap(function(d){return NAMES_OF(d).map(function(n){return [n,d.defaultFreq]})}));
/* Legacy dose list, kept for saved patient records (same values as the strengths) */
window.GDMT_DOSES=Object.assign({},window.GDMT_STRENGTHS);
window.lookup=function(name){return (window.LOOKUPS&&window.LOOKUPS[name])?window.LOOKUPS[name].slice():[]};

/* =========================================================
   Master Curated Lists for Standardization (Prevents Data Fragmentation)
   Ensures cities, zones, and titles are spelled identically across the registry.
   ========================================================= */
window.PAKISTAN_CITIES=LOCATION_DATA.pakistanCities;

window.PAKISTAN_ZONES=LOCATION_DATA.pakistanZones;

window.CLINICAL_DESIGNATIONS=LOCATION_DATA.clinicalDesignations;

window.CITY_ALIASES=LOCATION_DATA.cityAliases;

window.ZONE_ALIASES=LOCATION_DATA.zoneAliases;

window.DESIG_ALIASES=LOCATION_DATA.designationAliases;

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
