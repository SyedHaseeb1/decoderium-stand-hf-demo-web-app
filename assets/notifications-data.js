/* Dummy notifications for the prototype, keyed by username (as in access.js).
   Each one names its site, so the header can show only what a user is allowed to see.
   link.patient and link.tab open that record in the records page (use "Load demo" to create the sample patients). */
window.NOTIFICATIONS_DUMMY={
  'michael.johnson':[
    {id:'a1',site:'LHR',type:'admin',title:'New site investigator added',text:'Dr. Sarah Thompson was added to Lakeview Heart Clinic.',time:'Today, 09:12',link:{page:'admin'}},
    {id:'a2',site:'KHI',type:'info',title:'Export downloaded',text:'CSV export was downloaded by Robert Wilson.',time:'Yesterday, 17:40',link:{page:'records'}}
  ],
  'emily.carter':[
    {id:'e1',site:'RIC',type:'due',title:'3-month visit due',text:'RIC-001 is inside the 3-month window.',time:'Today, 08:30',link:{page:'records',patient:'RIC-001',tab:'m3'}},
    {id:'e2',site:'LHR',type:'overdue',title:'6-month visit overdue',text:'LHR-001 is past its 6-month window.',time:'Yesterday, 11:05',link:{page:'records',patient:'LHR-001',tab:'m6'}},
    {id:'e3',site:'RIC',type:'missing',title:'Baseline not completed',text:'RIC-002 has no completed baseline visit.',time:'Mon, 16:20',link:{page:'records',patient:'RIC-002',tab:'b'}}
  ],
  'robert.wilson':[
    {id:'r1',site:'KHI',type:'missing',title:'Missed 3-month visit',text:'KHI-002 missed the 3-month visit window.',time:'Today, 07:55',link:{page:'records',patient:'KHI-002',tab:'m3'}},
    {id:'r2',site:'ISB',type:'info',title:'Prescription uploaded',text:'ISB-002 has a new prescription file.',time:'Yesterday, 10:02',link:{page:'records',patient:'ISB-002',tab:'b'}}
  ]
};
