/* Option lists for dropdowns and the master lists, read from data/lookups.json (loaded by assets/boot.js).
   Use lookup(name) to get a copy of a list. Names are dotted: group.item */
var LOOKUP_DATA=window.STANDHF_DATA.lookups;
window.LOOKUPS=LOOKUP_DATA.options;

/* GDMT strengths per generic drug (E-CRF changes specification) */
window.GDMT_STRENGTHS=LOOKUP_DATA.gdmtStrengths;

/* Recommended default frequencies per drug (OD for most, BD for Carvedilol & Sacubitril Valsartan) */
window.GDMT_DEFAULT_FREQ=LOOKUP_DATA.gdmtDefaultFreq;

/* Legacy dose list retained for backward compatibility with existing saved patient objects */
window.GDMT_DOSES=LOOKUP_DATA.gdmtDoses;
window.lookup=function(name){return (window.LOOKUPS&&window.LOOKUPS[name])?window.LOOKUPS[name].slice():[]};

/* =========================================================
   Master Curated Lists for Standardization (Prevents Data Fragmentation)
   Ensures cities, zones, and titles are spelled identically across the registry.
   ========================================================= */
window.PAKISTAN_CITIES=LOOKUP_DATA.pakistanCities;

window.PAKISTAN_ZONES=LOOKUP_DATA.pakistanZones;

window.CLINICAL_DESIGNATIONS=LOOKUP_DATA.clinicalDesignations;

window.CITY_ALIASES=LOOKUP_DATA.cityAliases;

window.ZONE_ALIASES=LOOKUP_DATA.zoneAliases;

window.DESIG_ALIASES=LOOKUP_DATA.designationAliases;

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
