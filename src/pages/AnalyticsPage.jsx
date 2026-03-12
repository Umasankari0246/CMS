import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { cmsRoles, getValidRole, roleMenuGroups } from '../data/roleConfig';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ico = {
  Grad:     () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 2.26L19.02 9 12 12.74 4.98 9 12 5.26zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>,
  Menu:     () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>,
  Logout:   () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>,
  Back:     () => <svg viewBox="0 0 24 24" width="18" height="18" fill="#6b7280"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>,
  Filter:   () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>,
  Up:       () => <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/></svg>,
  Down:     () => <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6h-6z"/></svg>,
  Calendar: () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.89 3 3 3.9 3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>,
  Download: () => <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zm-8 2V5h2v6h1.17L12 13.17 9.83 11H11zm-6 7h14v2H5z"/></svg>,
  ChevL:    () => <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>,
  ChevR:    () => <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>,
  Close:    () => <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>,
};

const C = { blue:'#2563eb', cyan:'#06b6d4', green:'#22c55e', orange:'#f97316', purple:'#8b5cf6', red:'#ef4444' };
const PIE_COLS = [C.green, C.orange, C.red];
const TT = { contentStyle:{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:10, fontSize:12, boxShadow:'0 4px 12px rgba(0,0,0,.08)' } };
const H = 210;

const MONTHS_ALL = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const YEARS = [2024, 2025, 2026];

// MonthYear key helpers
function myToKey({ month, year }) { return year * 12 + month; }
function keyToMY(k) { return { month: k % 12, year: Math.floor(k / 12) }; }
function myLabel({ month, year }) { return `${MONTHS_ALL[month]} ${year}`; }

// ─── Data ─────────────────────────────────────────────────────────────────────
const studentAttByMonth = {
  Jan:{DBMS:88,DS:82,Phy:72,Math:86,Elective:94},Feb:{DBMS:90,DS:85,Phy:74,Math:88,Elective:96},
  Mar:{DBMS:92,DS:87,Phy:76,Math:89,Elective:95},Apr:{DBMS:85,DS:80,Phy:70,Math:84,Elective:91},
  May:{DBMS:78,DS:75,Phy:65,Math:79,Elective:88},Jun:{DBMS:82,DS:78,Phy:68,Math:83,Elective:90},
  Jul:{DBMS:89,DS:84,Phy:73,Math:87,Elective:93},Aug:{DBMS:91,DS:86,Phy:75,Math:88,Elective:95},
  Sep:{DBMS:87,DS:83,Phy:71,Math:85,Elective:92},Oct:{DBMS:93,DS:88,Phy:77,Math:90,Elective:97},
  Nov:{DBMS:84,DS:80,Phy:69,Math:82,Elective:89},Dec:{DBMS:80,DS:76,Phy:64,Math:78,Elective:86},
};
const studentMarksByMonth = {
  Jan:[{test:'T1',DBMS:68,DS:64,Phy:58,Math:72},{test:'T2',DBMS:72,DS:68,Phy:62,Math:76}],
  Feb:[{test:'T1',DBMS:74,DS:70,Phy:63,Math:78},{test:'Mid',DBMS:78,DS:74,Phy:67,Math:82}],
  Mar:[{test:'T1',DBMS:80,DS:76,Phy:68,Math:84},{test:'T2',DBMS:84,DS:79,Phy:71,Math:87},{test:'Mid',DBMS:86,DS:82,Phy:74,Math:89}],
  Apr:[{test:'T1',DBMS:82,DS:78,Phy:70,Math:86},{test:'Final',DBMS:88,DS:84,Phy:75,Math:91}],
  May:[{test:'T1',DBMS:76,DS:72,Phy:65,Math:80},{test:'T2',DBMS:80,DS:76,Phy:68,Math:83}],
  Jun:[{test:'Mid',DBMS:83,DS:79,Phy:70,Math:86},{test:'T',DBMS:85,DS:81,Phy:72,Math:88}],
  Jul:[{test:'T1',DBMS:79,DS:75,Phy:67,Math:82},{test:'T2',DBMS:82,DS:78,Phy:70,Math:85}],
  Aug:[{test:'T1',DBMS:85,DS:81,Phy:72,Math:88},{test:'Mid',DBMS:88,DS:84,Phy:75,Math:91}],
  Sep:[{test:'T1',DBMS:81,DS:77,Phy:69,Math:84},{test:'T2',DBMS:84,DS:80,Phy:72,Math:87}],
  Oct:[{test:'T1',DBMS:87,DS:83,Phy:74,Math:90},{test:'Mid',DBMS:90,DS:86,Phy:77,Math:93}],
  Nov:[{test:'T1',DBMS:78,DS:74,Phy:66,Math:81},{test:'T2',DBMS:81,DS:77,Phy:69,Math:84}],
  Dec:[{test:'Final',DBMS:86,DS:82,Phy:73,Math:89}],
};
const studentAssignByMonth = {
  Jan:[{week:'Wk1',completed:3,pending:2},{week:'Wk2',completed:4,pending:1},{week:'Wk3',completed:2,pending:3},{week:'Wk4',completed:5,pending:0}],
  Feb:[{week:'Wk1',completed:4,pending:1},{week:'Wk2',completed:5,pending:0},{week:'Wk3',completed:3,pending:2},{week:'Wk4',completed:5,pending:0}],
  Mar:[{week:'Wk1',completed:5,pending:0},{week:'Wk2',completed:4,pending:1},{week:'Wk3',completed:3,pending:2},{week:'Wk4',completed:5,pending:0}],
  Apr:[{week:'Wk1',completed:3,pending:2},{week:'Wk2',completed:4,pending:1},{week:'Wk3',completed:5,pending:0},{week:'Wk4',completed:4,pending:1}],
  May:[{week:'Wk1',completed:2,pending:3},{week:'Wk2',completed:4,pending:1},{week:'Wk3',completed:4,pending:1},{week:'Wk4',completed:5,pending:0}],
  Jun:[{week:'Wk1',completed:4,pending:1},{week:'Wk2',completed:5,pending:0},{week:'Wk3',completed:3,pending:2},{week:'Wk4',completed:4,pending:1}],
  Jul:[{week:'Wk1',completed:3,pending:2},{week:'Wk2',completed:5,pending:0},{week:'Wk3',completed:4,pending:1},{week:'Wk4',completed:5,pending:0}],
  Aug:[{week:'Wk1',completed:4,pending:1},{week:'Wk2',completed:5,pending:0},{week:'Wk3',completed:5,pending:0},{week:'Wk4',completed:4,pending:1}],
  Sep:[{week:'Wk1',completed:3,pending:2},{week:'Wk2',completed:4,pending:1},{week:'Wk3',completed:5,pending:0},{week:'Wk4',completed:5,pending:0}],
  Oct:[{week:'Wk1',completed:5,pending:0},{week:'Wk2',completed:5,pending:0},{week:'Wk3',completed:4,pending:1},{week:'Wk4',completed:5,pending:0}],
  Nov:[{week:'Wk1',completed:3,pending:2},{week:'Wk2',completed:4,pending:1},{week:'Wk3',completed:3,pending:2},{week:'Wk4',completed:4,pending:1}],
  Dec:[{week:'Wk1',completed:4,pending:1},{week:'Wk2',completed:5,pending:0},{week:'Wk3',completed:3,pending:2}],
};
const studentCardsByMonth = {
  Jan:{att:'82%',assign:'14/18',cgpa:'8.2',exams:'2'},Feb:{att:'84%',assign:'18/22',cgpa:'8.3',exams:'1'},
  Mar:{att:'84%',assign:'26/30',cgpa:'8.6',exams:'3'},Apr:{att:'80%',assign:'20/24',cgpa:'8.5',exams:'4'},
  May:{att:'76%',assign:'16/20',cgpa:'8.4',exams:'2'},Jun:{att:'78%',assign:'18/22',cgpa:'8.3',exams:'1'},
  Jul:{att:'83%',assign:'20/24',cgpa:'8.4',exams:'2'},Aug:{att:'86%',assign:'24/28',cgpa:'8.7',exams:'3'},
  Sep:{att:'81%',assign:'22/26',cgpa:'8.5',exams:'2'},Oct:{att:'89%',assign:'26/28',cgpa:'8.8',exams:'4'},
  Nov:{att:'79%',assign:'18/22',cgpa:'8.4',exams:'2'},Dec:{att:'77%',assign:'14/16',cgpa:'8.6',exams:'5'},
};
const facultyAttByMonth = {
  Jan:[{week:'Wk1',CS6001:88,CS6002:84,Phy:82},{week:'Wk2',CS6001:90,CS6002:86,Phy:80},{week:'Wk3',CS6001:87,CS6002:83,Phy:78},{week:'Wk4',CS6001:91,CS6002:87,Phy:83}],
  Feb:[{week:'Wk1',CS6001:89,CS6002:85,Phy:81},{week:'Wk2',CS6001:92,CS6002:88,Phy:84},{week:'Wk3',CS6001:90,CS6002:86,Phy:82},{week:'Wk4',CS6001:93,CS6002:89,Phy:85}],
  Mar:[{week:'Wk1',CS6001:91,CS6002:87,Phy:83},{week:'Wk2',CS6001:89,CS6002:84,Phy:80},{week:'Wk3',CS6001:93,CS6002:90,Phy:85},{week:'Wk4',CS6001:87,CS6002:85,Phy:81}],
  Apr:[{week:'Wk1',CS6001:84,CS6002:80,Phy:76},{week:'Wk2',CS6001:88,CS6002:83,Phy:79},{week:'Wk3',CS6001:86,CS6002:82,Phy:77},{week:'Wk4',CS6001:90,CS6002:86,Phy:82}],
  May:[{week:'Wk1',CS6001:82,CS6002:78,Phy:74},{week:'Wk2',CS6001:85,CS6002:81,Phy:77},{week:'Wk3',CS6001:83,CS6002:79,Phy:75},{week:'Wk4',CS6001:87,CS6002:83,Phy:79}],
  Jun:[{week:'Wk1',CS6001:85,CS6002:81,Phy:77},{week:'Wk2',CS6001:88,CS6002:84,Phy:80},{week:'Wk3',CS6001:86,CS6002:82,Phy:78},{week:'Wk4',CS6001:90,CS6002:86,Phy:82}],
  Jul:[{week:'Wk1',CS6001:87,CS6002:83,Phy:79},{week:'Wk2',CS6001:89,CS6002:85,Phy:81},{week:'Wk3',CS6001:91,CS6002:87,Phy:83},{week:'Wk4',CS6001:88,CS6002:84,Phy:80}],
  Aug:[{week:'Wk1',CS6001:90,CS6002:86,Phy:82},{week:'Wk2',CS6001:92,CS6002:88,Phy:84},{week:'Wk3',CS6001:91,CS6002:87,Phy:83},{week:'Wk4',CS6001:93,CS6002:89,Phy:85}],
  Sep:[{week:'Wk1',CS6001:88,CS6002:84,Phy:80},{week:'Wk2',CS6001:90,CS6002:86,Phy:82},{week:'Wk3',CS6001:87,CS6002:83,Phy:79},{week:'Wk4',CS6001:91,CS6002:87,Phy:83}],
  Oct:[{week:'Wk1',CS6001:92,CS6002:88,Phy:84},{week:'Wk2',CS6001:94,CS6002:90,Phy:86},{week:'Wk3',CS6001:91,CS6002:87,Phy:83},{week:'Wk4',CS6001:93,CS6002:89,Phy:85}],
  Nov:[{week:'Wk1',CS6001:86,CS6002:82,Phy:78},{week:'Wk2',CS6001:88,CS6002:84,Phy:80},{week:'Wk3',CS6001:85,CS6002:81,Phy:77},{week:'Wk4',CS6001:87,CS6002:83,Phy:79}],
  Dec:[{week:'Wk1',CS6001:84,CS6002:80,Phy:76},{week:'Wk2',CS6001:86,CS6002:82,Phy:78},{week:'Wk3',CS6001:83,CS6002:79,Phy:75}],
};
const facultySubByMonth = {
  Jan:[{week:'Wk1',onTime:38,late:7,missing:5},{week:'Wk2',onTime:41,late:5,missing:4},{week:'Wk3',onTime:39,late:6,missing:5},{week:'Wk4',onTime:43,late:4,missing:3}],
  Feb:[{week:'Wk1',onTime:40,late:6,missing:4},{week:'Wk2',onTime:43,late:4,missing:3},{week:'Wk3',onTime:42,late:5,missing:3},{week:'Wk4',onTime:44,late:3,missing:3}],
  Mar:[{week:'Wk1',onTime:42,late:5,missing:3},{week:'Wk2',onTime:38,late:8,missing:4},{week:'Wk3',onTime:44,late:4,missing:2},{week:'Wk4',onTime:40,late:7,missing:3}],
  Apr:[{week:'Wk1',onTime:36,late:9,missing:5},{week:'Wk2',onTime:39,late:7,missing:4},{week:'Wk3',onTime:41,late:6,missing:3},{week:'Wk4',onTime:43,late:4,missing:3}],
  May:[{week:'Wk1',onTime:35,late:10,missing:5},{week:'Wk2',onTime:38,late:8,missing:4},{week:'Wk3',onTime:40,late:7,missing:3},{week:'Wk4',onTime:42,late:5,missing:3}],
  Jun:[{week:'Wk1',onTime:39,late:7,missing:4},{week:'Wk2',onTime:41,late:5,missing:4},{week:'Wk3',onTime:43,late:4,missing:3},{week:'Wk4',onTime:44,late:3,missing:3}],
  Jul:[{week:'Wk1',onTime:40,late:6,missing:4},{week:'Wk2',onTime:43,late:4,missing:3},{week:'Wk3',onTime:44,late:4,missing:2},{week:'Wk4',onTime:45,late:3,missing:2}],
  Aug:[{week:'Wk1',onTime:42,late:5,missing:3},{week:'Wk2',onTime:44,late:3,missing:3},{week:'Wk3',onTime:45,late:3,missing:2},{week:'Wk4',onTime:46,late:2,missing:2}],
  Sep:[{week:'Wk1',onTime:41,late:6,missing:3},{week:'Wk2',onTime:43,late:4,missing:3},{week:'Wk3',onTime:44,late:4,missing:2},{week:'Wk4',onTime:45,late:3,missing:2}],
  Oct:[{week:'Wk1',onTime:44,late:4,missing:2},{week:'Wk2',onTime:46,late:2,missing:2},{week:'Wk3',onTime:45,late:3,missing:2},{week:'Wk4',onTime:47,late:2,missing:1}],
  Nov:[{week:'Wk1',onTime:40,late:6,missing:4},{week:'Wk2',onTime:42,late:5,missing:3},{week:'Wk3',onTime:41,late:6,missing:3},{week:'Wk4',onTime:43,late:4,missing:3}],
  Dec:[{week:'Wk1',onTime:38,late:7,missing:5},{week:'Wk2',onTime:40,late:6,missing:4},{week:'Wk3',onTime:39,late:7,missing:4}],
};
const facultyCardsByMonth = {
  Jan:{students:'152',att:'86%',submitted:'580',pending:'45'},Feb:{students:'154',att:'88%',submitted:'598',pending:'38'},
  Mar:{students:'156',att:'87%',submitted:'612',pending:'34'},Apr:{students:'153',att:'83%',submitted:'570',pending:'50'},
  May:{students:'150',att:'80%',submitted:'548',pending:'62'},Jun:{students:'151',att:'82%',submitted:'560',pending:'55'},
  Jul:{students:'155',att:'85%',submitted:'588',pending:'42'},Aug:{students:'157',att:'89%',submitted:'620',pending:'30'},
  Sep:{students:'155',att:'86%',submitted:'600',pending:'36'},Oct:{students:'158',att:'91%',submitted:'634',pending:'22'},
  Nov:{students:'154',att:'84%',submitted:'575',pending:'46'},Dec:{students:'150',att:'81%',submitted:'548',pending:'52'},
};
const adminAttByMonth = {
  Jan:[{dept:'CS',avg:86},{dept:'Phys',avg:82},{dept:'Math',avg:80},{dept:'ECE',avg:84},{dept:'Mech',avg:81}],
  Feb:[{dept:'CS',avg:88},{dept:'Phys',avg:84},{dept:'Math',avg:82},{dept:'ECE',avg:86},{dept:'Mech',avg:83}],
  Mar:[{dept:'CS',avg:87},{dept:'Phys',avg:83},{dept:'Math',avg:81},{dept:'ECE',avg:85},{dept:'Mech',avg:82}],
  Apr:[{dept:'CS',avg:84},{dept:'Phys',avg:80},{dept:'Math',avg:78},{dept:'ECE',avg:82},{dept:'Mech',avg:79}],
  May:[{dept:'CS',avg:80},{dept:'Phys',avg:76},{dept:'Math',avg:74},{dept:'ECE',avg:78},{dept:'Mech',avg:75}],
  Jun:[{dept:'CS',avg:82},{dept:'Phys',avg:78},{dept:'Math',avg:76},{dept:'ECE',avg:80},{dept:'Mech',avg:77}],
  Jul:[{dept:'CS',avg:85},{dept:'Phys',avg:81},{dept:'Math',avg:79},{dept:'ECE',avg:83},{dept:'Mech',avg:80}],
  Aug:[{dept:'CS',avg:89},{dept:'Phys',avg:85},{dept:'Math',avg:83},{dept:'ECE',avg:87},{dept:'Mech',avg:84}],
  Sep:[{dept:'CS',avg:86},{dept:'Phys',avg:82},{dept:'Math',avg:80},{dept:'ECE',avg:84},{dept:'Mech',avg:81}],
  Oct:[{dept:'CS',avg:91},{dept:'Phys',avg:87},{dept:'Math',avg:85},{dept:'ECE',avg:89},{dept:'Mech',avg:86}],
  Nov:[{dept:'CS',avg:83},{dept:'Phys',avg:79},{dept:'Math',avg:77},{dept:'ECE',avg:81},{dept:'Mech',avg:78}],
  Dec:[{dept:'CS',avg:79},{dept:'Phys',avg:75},{dept:'Math',avg:73},{dept:'ECE',avg:77},{dept:'Mech',avg:74}],
};
const adminExamByMonth = {
  Jan:[{dept:'CS',pass:88,fail:12},{dept:'Phys',pass:82,fail:18},{dept:'Math',pass:79,fail:21},{dept:'ECE',pass:85,fail:15},{dept:'Mech',pass:81,fail:19}],
  Feb:[{dept:'CS',pass:90,fail:10},{dept:'Phys',pass:84,fail:16},{dept:'Math',pass:81,fail:19},{dept:'ECE',pass:87,fail:13},{dept:'Mech',pass:83,fail:17}],
  Mar:[{dept:'CS',pass:94,fail:6},{dept:'Phys',pass:88,fail:12},{dept:'Math',pass:85,fail:15},{dept:'ECE',pass:91,fail:9},{dept:'Mech',pass:87,fail:13}],
  Apr:[{dept:'CS',pass:86,fail:14},{dept:'Phys',pass:80,fail:20},{dept:'Math',pass:77,fail:23},{dept:'ECE',pass:83,fail:17},{dept:'Mech',pass:79,fail:21}],
  May:[{dept:'CS',pass:82,fail:18},{dept:'Phys',pass:76,fail:24},{dept:'Math',pass:73,fail:27},{dept:'ECE',pass:79,fail:21},{dept:'Mech',pass:75,fail:25}],
  Jun:[{dept:'CS',pass:84,fail:16},{dept:'Phys',pass:78,fail:22},{dept:'Math',pass:75,fail:25},{dept:'ECE',pass:81,fail:19},{dept:'Mech',pass:77,fail:23}],
  Jul:[{dept:'CS',pass:87,fail:13},{dept:'Phys',pass:81,fail:19},{dept:'Math',pass:78,fail:22},{dept:'ECE',pass:84,fail:16},{dept:'Mech',pass:80,fail:20}],
  Aug:[{dept:'CS',pass:91,fail:9},{dept:'Phys',pass:85,fail:15},{dept:'Math',pass:82,fail:18},{dept:'ECE',pass:88,fail:12},{dept:'Mech',pass:84,fail:16}],
  Sep:[{dept:'CS',pass:89,fail:11},{dept:'Phys',pass:83,fail:17},{dept:'Math',pass:80,fail:20},{dept:'ECE',pass:86,fail:14},{dept:'Mech',pass:82,fail:18}],
  Oct:[{dept:'CS',pass:93,fail:7},{dept:'Phys',pass:87,fail:13},{dept:'Math',pass:84,fail:16},{dept:'ECE',pass:90,fail:10},{dept:'Mech',pass:86,fail:14}],
  Nov:[{dept:'CS',pass:85,fail:15},{dept:'Phys',pass:79,fail:21},{dept:'Math',pass:76,fail:24},{dept:'ECE',pass:82,fail:18},{dept:'Mech',pass:78,fail:22}],
  Dec:[{dept:'CS',pass:87,fail:13},{dept:'Phys',pass:81,fail:19},{dept:'Math',pass:78,fail:22},{dept:'ECE',pass:84,fail:16},{dept:'Mech',pass:80,fail:20}],
};
const adminCardsByMonth = {
  Jan:{students:'2,590',faculty:'388',depts:'5',courses:'44'},Feb:{students:'2,620',faculty:'392',depts:'5',courses:'46'},
  Mar:{students:'2,690',faculty:'400',depts:'5',courses:'48'},Apr:{students:'2,710',faculty:'402',depts:'5',courses:'48'},
  May:{students:'2,680',faculty:'398',depts:'5',courses:'46'},Jun:{students:'2,650',faculty:'394',depts:'5',courses:'44'},
  Jul:{students:'2,700',faculty:'400',depts:'5',courses:'47'},Aug:{students:'2,750',faculty:'406',depts:'5',courses:'49'},
  Sep:{students:'2,720',faculty:'402',depts:'5',courses:'48'},Oct:{students:'2,760',faculty:'408',depts:'5',courses:'50'},
  Nov:{students:'2,700',faculty:'400',depts:'5',courses:'47'},Dec:{students:'2,650',faculty:'394',depts:'5',courses:'44'},
};
const financeColByMonth = {
  Jan:[{week:'Wk1',collected:820000,target:900000},{week:'Wk2',collected:950000,target:900000},{week:'Wk3',collected:780000,target:900000},{week:'Wk4',collected:860000,target:900000}],
  Feb:[{week:'Wk1',collected:880000,target:900000},{week:'Wk2',collected:920000,target:900000},{week:'Wk3',collected:840000,target:900000},{week:'Wk4',collected:900000,target:900000}],
  Mar:[{week:'Wk1',collected:950000,target:1000000},{week:'Wk2',collected:880000,target:1000000},{week:'Wk3',collected:1020000,target:1000000},{week:'Wk4',collected:940000,target:1000000}],
  Apr:[{week:'Wk1',collected:760000,target:900000},{week:'Wk2',collected:820000,target:900000},{week:'Wk3',collected:800000,target:900000},{week:'Wk4',collected:840000,target:900000}],
  May:[{week:'Wk1',collected:700000,target:850000},{week:'Wk2',collected:760000,target:850000},{week:'Wk3',collected:740000,target:850000},{week:'Wk4',collected:800000,target:850000}],
  Jun:[{week:'Wk1',collected:780000,target:900000},{week:'Wk2',collected:820000,target:900000},{week:'Wk3',collected:860000,target:900000},{week:'Wk4',collected:900000,target:900000}],
  Jul:[{week:'Wk1',collected:830000,target:900000},{week:'Wk2',collected:870000,target:900000},{week:'Wk3',collected:820000,target:900000},{week:'Wk4',collected:880000,target:900000}],
  Aug:[{week:'Wk1',collected:900000,target:950000},{week:'Wk2',collected:940000,target:950000},{week:'Wk3',collected:920000,target:950000},{week:'Wk4',collected:960000,target:950000}],
  Sep:[{week:'Wk1',collected:860000,target:920000},{week:'Wk2',collected:900000,target:920000},{week:'Wk3',collected:880000,target:920000},{week:'Wk4',collected:920000,target:920000}],
  Oct:[{week:'Wk1',collected:960000,target:1000000},{week:'Wk2',collected:1000000,target:1000000},{week:'Wk3',collected:980000,target:1000000},{week:'Wk4',collected:1020000,target:1000000}],
  Nov:[{week:'Wk1',collected:820000,target:900000},{week:'Wk2',collected:860000,target:900000},{week:'Wk3',collected:840000,target:900000},{week:'Wk4',collected:880000,target:900000}],
  Dec:[{week:'Wk1',collected:780000,target:850000},{week:'Wk2',collected:820000,target:850000},{week:'Wk3',collected:800000,target:850000}],
};
const financePieByMonth = {
  Jan:[{name:'Paid',value:68},{name:'Pending',value:22},{name:'Overdue',value:10}],
  Feb:[{name:'Paid',value:70},{name:'Pending',value:20},{name:'Overdue',value:10}],
  Mar:[{name:'Paid',value:72},{name:'Pending',value:18},{name:'Overdue',value:10}],
  Apr:[{name:'Paid',value:65},{name:'Pending',value:25},{name:'Overdue',value:10}],
  May:[{name:'Paid',value:62},{name:'Pending',value:28},{name:'Overdue',value:10}],
  Jun:[{name:'Paid',value:66},{name:'Pending',value:24},{name:'Overdue',value:10}],
  Jul:[{name:'Paid',value:69},{name:'Pending',value:21},{name:'Overdue',value:10}],
  Aug:[{name:'Paid',value:74},{name:'Pending',value:17},{name:'Overdue',value:9}],
  Sep:[{name:'Paid',value:71},{name:'Pending',value:20},{name:'Overdue',value:9}],
  Oct:[{name:'Paid',value:76},{name:'Pending',value:16},{name:'Overdue',value:8}],
  Nov:[{name:'Paid',value:68},{name:'Pending',value:22},{name:'Overdue',value:10}],
  Dec:[{name:'Paid',value:70},{name:'Pending',value:20},{name:'Overdue',value:10}],
};
const financeDeptByMonth = {
  Jan:[{dept:'CS',paid:580,pending:120,overdue:80},{dept:'Phys',paid:280,pending:90,overdue:50},{dept:'Math',paid:240,pending:80,overdue:40},{dept:'ECE',paid:380,pending:100,overdue:60},{dept:'Mech',paid:320,pending:90,overdue:50}],
  Feb:[{dept:'CS',paid:610,pending:100,overdue:70},{dept:'Phys',paid:295,pending:80,overdue:45},{dept:'Math',paid:255,pending:70,overdue:35},{dept:'ECE',paid:400,pending:88,overdue:52},{dept:'Mech',paid:338,pending:80,overdue:42}],
  Mar:[{dept:'CS',paid:680,pending:88,overdue:52},{dept:'Phys',paid:320,pending:62,overdue:38},{dept:'Math',paid:280,pending:54,overdue:26},{dept:'ECE',paid:440,pending:72,overdue:48},{dept:'Mech',paid:370,pending:68,overdue:42}],
  Apr:[{dept:'CS',paid:560,pending:130,overdue:90},{dept:'Phys',paid:260,pending:100,overdue:60},{dept:'Math',paid:220,pending:90,overdue:50},{dept:'ECE',paid:360,pending:110,overdue:70},{dept:'Mech',paid:300,pending:100,overdue:60}],
  May:[{dept:'CS',paid:520,pending:150,overdue:100},{dept:'Phys',paid:240,pending:112,overdue:68},{dept:'Math',paid:200,pending:104,overdue:56},{dept:'ECE',paid:340,pending:122,overdue:78},{dept:'Mech',paid:280,pending:112,overdue:68}],
  Jun:[{dept:'CS',paid:570,pending:120,overdue:80},{dept:'Phys',paid:268,pending:94,overdue:58},{dept:'Math',paid:228,pending:86,overdue:46},{dept:'ECE',paid:370,pending:106,overdue:64},{dept:'Mech',paid:308,pending:96,overdue:56}],
  Jul:[{dept:'CS',paid:600,pending:108,overdue:72},{dept:'Phys',paid:285,pending:82,overdue:53},{dept:'Math',paid:245,pending:74,overdue:41},{dept:'ECE',paid:390,pending:94,overdue:56},{dept:'Mech',paid:328,pending:84,overdue:48}],
  Aug:[{dept:'CS',paid:640,pending:92,overdue:58},{dept:'Phys',paid:302,pending:70,overdue:48},{dept:'Math',paid:262,pending:62,overdue:36},{dept:'ECE',paid:415,pending:80,overdue:55},{dept:'Mech',paid:348,pending:72,overdue:50}],
  Sep:[{dept:'CS',paid:618,pending:100,overdue:62},{dept:'Phys',paid:290,pending:76,overdue:54},{dept:'Math',paid:250,pending:68,overdue:42},{dept:'ECE',paid:402,pending:86,overdue:52},{dept:'Mech',paid:337,pending:77,overdue:46}],
  Oct:[{dept:'CS',paid:666,pending:82,overdue:52},{dept:'Phys',paid:310,pending:60,overdue:40},{dept:'Math',paid:270,pending:52,overdue:28},{dept:'ECE',paid:428,pending:68,overdue:44},{dept:'Mech',paid:358,pending:62,overdue:40}],
  Nov:[{dept:'CS',paid:590,pending:112,overdue:78},{dept:'Phys',paid:275,pending:88,overdue:57},{dept:'Math',paid:235,pending:80,overdue:45},{dept:'ECE',paid:376,pending:98,overdue:66},{dept:'Mech',paid:314,pending:88,overdue:58}],
  Dec:[{dept:'CS',paid:572,pending:118,overdue:80},{dept:'Phys',paid:265,pending:95,overdue:60},{dept:'Math',paid:225,pending:87,overdue:48},{dept:'ECE',paid:363,pending:107,overdue:70},{dept:'Mech',paid:305,pending:97,overdue:58}],
};
const financeCardsByMonth = {
  Jan:{collected:'₹1.8Cr',pending:'₹58L',scholarships:'138',late:'32'},Feb:{collected:'₹2.0Cr',pending:'₹52L',scholarships:'140',late:'30'},
  Mar:{collected:'₹2.4Cr',pending:'₹48L',scholarships:'142',late:'28'},Apr:{collected:'₹1.7Cr',pending:'₹64L',scholarships:'135',late:'36'},
  May:{collected:'₹1.5Cr',pending:'₹72L',scholarships:'130',late:'40'},Jun:{collected:'₹1.6Cr',pending:'₹66L',scholarships:'132',late:'38'},
  Jul:{collected:'₹1.9Cr',pending:'₹55L',scholarships:'136',late:'34'},Aug:{collected:'₹2.2Cr',pending:'₹44L',scholarships:'140',late:'26'},
  Sep:{collected:'₹2.1Cr',pending:'₹50L',scholarships:'138',late:'30'},Oct:{collected:'₹2.5Cr',pending:'₹40L',scholarships:'144',late:'22'},
  Nov:{collected:'₹1.8Cr',pending:'₹58L',scholarships:'136',late:'32'},Dec:{collected:'₹1.9Cr',pending:'₹54L',scholarships:'138',late:'30'},
};
const marksDistByMonth = {
  Jan:[{range:'O (≥90)',count:6},{range:'A+ (80-89)',count:12},{range:'A (70-79)',count:20},{range:'B+ (60-69)',count:14},{range:'B (50-59)',count:8},{range:'F (<50)',count:6}],
  Feb:[{range:'O (≥90)',count:8},{range:'A+ (80-89)',count:14},{range:'A (70-79)',count:21},{range:'B+ (60-69)',count:13},{range:'B (50-59)',count:7},{range:'F (<50)',count:5}],
  Mar:[{range:'O (≥90)',count:12},{range:'A+ (80-89)',count:18},{range:'A (70-79)',count:22},{range:'B+ (60-69)',count:14},{range:'B (50-59)',count:8},{range:'F (<50)',count:4}],
  Apr:[{range:'O (≥90)',count:9},{range:'A+ (80-89)',count:15},{range:'A (70-79)',count:19},{range:'B+ (60-69)',count:15},{range:'B (50-59)',count:9},{range:'F (<50)',count:5}],
  May:[{range:'O (≥90)',count:7},{range:'A+ (80-89)',count:13},{range:'A (70-79)',count:18},{range:'B+ (60-69)',count:16},{range:'B (50-59)',count:10},{range:'F (<50)',count:6}],
  Jun:[{range:'O (≥90)',count:8},{range:'A+ (80-89)',count:14},{range:'A (70-79)',count:20},{range:'B+ (60-69)',count:14},{range:'B (50-59)',count:9},{range:'F (<50)',count:5}],
  Jul:[{range:'O (≥90)',count:10},{range:'A+ (80-89)',count:16},{range:'A (70-79)',count:21},{range:'B+ (60-69)',count:13},{range:'B (50-59)',count:8},{range:'F (<50)',count:4}],
  Aug:[{range:'O (≥90)',count:13},{range:'A+ (80-89)',count:19},{range:'A (70-79)',count:22},{range:'B+ (60-69)',count:12},{range:'B (50-59)',count:7},{range:'F (<50)',count:3}],
  Sep:[{range:'O (≥90)',count:11},{range:'A+ (80-89)',count:17},{range:'A (70-79)',count:21},{range:'B+ (60-69)',count:13},{range:'B (50-59)',count:8},{range:'F (<50)',count:4}],
  Oct:[{range:'O (≥90)',count:15},{range:'A+ (80-89)',count:20},{range:'A (70-79)',count:23},{range:'B+ (60-69)',count:11},{range:'B (50-59)',count:6},{range:'F (<50)',count:3}],
  Nov:[{range:'O (≥90)',count:9},{range:'A+ (80-89)',count:15},{range:'A (70-79)',count:20},{range:'B+ (60-69)',count:14},{range:'B (50-59)',count:9},{range:'F (<50)',count:5}],
  Dec:[{range:'O (≥90)',count:10},{range:'A+ (80-89)',count:16},{range:'A (70-79)',count:20},{range:'B+ (60-69)',count:13},{range:'B (50-59)',count:8},{range:'F (<50)',count:5}],
};

const INSIGHTS = {
  student:{
    improvement:[{subject:'English',attendance:'70%',lastGrade:'C+',risk:'high'},{subject:'Physics',attendance:'76%',lastGrade:'B-',risk:'medium'}],
    recentGrades:[{subject:'DBMS',grade:'A',score:85,date:'Mar 08'},{subject:'Math',grade:'A+',score:92,date:'Mar 06'},{subject:'DS',grade:'B+',score:79,date:'Mar 05'}],
    deadlines:[{title:'DBMS Assignment 3',due:'Mar 20',status:'pending'},{title:'Physics Lab Report',due:'Mar 22',status:'pending'},{title:'Math Problem Set 4',due:'Mar 25',status:'upcoming'}],
  },
  faculty:{
    lowAttendance:[{name:'Ravi Kumar',rollNo:'CS21041',att:'62%',course:'CS 6.001'},{name:'Sneha Patel',rollNo:'CS21053',att:'65%',course:'CS 6.002'},{name:'Arjun Sharma',rollNo:'PH21012',att:'68%',course:'PHY 8.01'}],
    missingAssign:[{name:'Priya Nair',rollNo:'CS21034',missing:3,course:'CS 6.001'},{name:'Amit Singh',rollNo:'CS21067',missing:2,course:'CS 6.002'}],
    topStudents:[{name:'Alex Chen',rollNo:'CS21001',avg:'94%',grade:'O'},{name:'Maria Gomez',rollNo:'CS21008',avg:'91%',grade:'O'},{name:'James Kim',rollNo:'CS21015',avg:'88%',grade:'A+'}],
  },
  admin:{
    lowAtt:[{dept:'Mathematics',count:34,threshold:'<75%'},{dept:'Physics',count:28,threshold:'<75%'},{dept:'Mechanical',count:22,threshold:'<75%'}],
    topDepts:[{dept:'Computer Sc.',avgScore:'87%',passRate:'94%'},{dept:'Electronics',avgScore:'84%',passRate:'91%'},{dept:'Physics',avgScore:'81%',passRate:'88%'}],
    newAdmissions:[{name:'Kavya Reddy',dept:'CS',date:'Mar 10'},{name:'Rohan Mehta',dept:'ECE',date:'Mar 09'},{name:'Tanya Joshi',dept:'Math',date:'Mar 08'}],
  },
  finance:{
    pendingStudents:[{name:'Ravi Kumar',rollNo:'CS21041',amount:'₹45,000',due:'Mar 25',dept:'CS'},{name:'Sneha Patel',rollNo:'PH21053',amount:'₹42,000',due:'Mar 25',dept:'Phys'},{name:'Arjun Sharma',rollNo:'ME21022',amount:'₹38,000',due:'Mar 20',dept:'Mech'},{name:'Priya Nair',rollNo:'EC21034',amount:'₹44,000',due:'Mar 15',dept:'ECE'}],
    topDepts:[{dept:'CS',collected:'₹68L',rate:'88%'},{dept:'ECE',collected:'₹44L',rate:'82%'},{dept:'Mech',collected:'₹37L',rate:'80%'}],
    overdue:[{name:'Vikram Singh',rollNo:'CS21067',amount:'₹45,000',days:15},{name:'Meena Patel',rollNo:'PH21044',amount:'₹42,000',days:22},{name:'Karan Mehta',rollNo:'ME21018',amount:'₹38,000',days:8}],
  },
};

const SEMESTER_OPTS = ['Semester 4 (Current)','Semester 3','Semester 2','Semester 1'];
const DEPT_OPTS     = ['All Departments','Computer Science','Physics','Mathematics','Electronics','Mechanical'];
const COURSE_OPTS   = ['All Courses','DBMS','Data Structures','Physics','Mathematics','CS Elective'];

// Map dropdown label → data key used in chart data
const DEPT_CODE = {
  'All Departments':  null,
  'Computer Science': 'CS',
  'Physics':          'Phys',
  'Mathematics':      'Math',
  'Electronics':      'ECE',
  'Mechanical':       'Mech',
};

// ─── Aggregation ──────────────────────────────────────────────────────────────
function avgCardField(cardMap, months, field) {
  const vals = months.map(m=>{ const v=cardMap[m]?.[field]; if(!v)return null; const n=parseFloat(String(v).replace(/[^\d.]/g,'')); return isNaN(n)?null:n; }).filter(x=>x!==null);
  if(!vals.length)return cardMap['Mar']?.[field]??'—';
  const avg=vals.reduce((a,b)=>a+b,0)/vals.length;
  const sample=String(cardMap[months[months.length-1]]?.[field]??'');
  if(sample.includes('%'))return `${avg.toFixed(0)}%`;
  if(sample.includes('₹'))return cardMap[months[months.length-1]][field];
  if(sample.includes('/')){const t=months.reduce((a,m)=>{const p=String(cardMap[m]?.[field]??'0/0').split('/');return[a[0]+(parseInt(p[0])||0),a[1]+(parseInt(p[1])||0)];},[0,0]);return `${t[0]}/${t[1]}`;}
  if(sample.includes(','))return Math.round(avg).toLocaleString();
  return `${Math.round(avg)}`;
}
function avgAttSubject(months){return['DBMS','DS','Phy','Math','Elective'].map(s=>({subject:s,pct:Math.round(months.reduce((a,m)=>a+(studentAttByMonth[m]?.[s]??0),0)/months.length)}));}
function avgAdminAtt(months){return['CS','Phys','Math','ECE','Mech'].map(d=>({dept:d,avg:Math.round(months.reduce((s,m)=>{const r=(adminAttByMonth[m]??[]).find(x=>x.dept===d);return s+(r?.avg??0)},0)/months.length)}));}
function avgAdminExam(months){return['CS','Phys','Math','ECE','Mech'].map(d=>({dept:d,pass:Math.round(months.reduce((s,m)=>{const r=(adminExamByMonth[m]??[]).find(x=>x.dept===d);return s+(r?.pass??0)},0)/months.length),fail:Math.round(months.reduce((s,m)=>{const r=(adminExamByMonth[m]??[]).find(x=>x.dept===d);return s+(r?.fail??0)},0)/months.length)}));}
function avgFinancePie(months){return['Paid','Pending','Overdue'].map(n=>({name:n,value:Math.round(months.reduce((s,m)=>{const r=(financePieByMonth[m]??[]).find(x=>x.name===n);return s+(r?.value??0)},0)/months.length)}));}
function avgFinanceDept(months){return['CS','Phys','Math','ECE','Mech'].map(d=>({dept:d,paid:Math.round(months.reduce((s,m)=>{const r=(financeDeptByMonth[m]??[]).find(x=>x.dept===d);return s+(r?.paid??0)},0)/months.length),pending:Math.round(months.reduce((s,m)=>{const r=(financeDeptByMonth[m]??[]).find(x=>x.dept===d);return s+(r?.pending??0)},0)/months.length),overdue:Math.round(months.reduce((s,m)=>{const r=(financeDeptByMonth[m]??[]).find(x=>x.dept===d);return s+(r?.overdue??0)},0)/months.length)}));}
function avgMarksDist(months){const keys=['O (≥90)','A+ (80-89)','A (70-79)','B+ (60-69)','B (50-59)','F (<50)'];return keys.map(r=>({range:r,count:Math.round(months.reduce((s,m)=>{const d=(marksDistByMonth[m]??[]).find(x=>x.range===r);return s+(d?.count??0)},0)/months.length)}));}

function fmt(n){return(n/100000).toFixed(1)+'L';}

// ─── CSV Export ───────────────────────────────────────────────────────────────
function exportCSV(role, months, rangeLabel) {
  let headers=[], rows=[];
  if(role==='student'){
    headers=['Month','Attendance','CGPA','Assignments','Exams'];
    rows=months.map(m=>{const c=studentCardsByMonth[m]??studentCardsByMonth['Mar'];return[m,c.att,c.cgpa,c.assign,c.exams];});
  } else if(role==='faculty'){
    headers=['Month','Students','Avg Attendance','Submitted','Pending'];
    rows=months.map(m=>{const c=facultyCardsByMonth[m]??facultyCardsByMonth['Mar'];return[m,c.students,c.att,c.submitted,c.pending];});
  } else if(role==='admin'){
    headers=['Month','Total Students','Faculty','Avg Attendance','Pass Rate','Courses'];
    rows=months.map(m=>{const c=adminCardsByMonth[m]??adminCardsByMonth['Mar'];const att=Math.round((adminAttByMonth[m]??[]).reduce((s,d)=>s+d.avg,0)/((adminAttByMonth[m]??[]).length||1));const pass=Math.round((adminExamByMonth[m]??[]).reduce((s,d)=>s+d.pass,0)/((adminExamByMonth[m]??[]).length||1));return[m,c.students,c.faculty,`${att}%`,`${pass}%`,c.courses];});
  } else if(role==='finance'){
    headers=['Month','Collected','Pending','Paid%','Scholarships','Late Payments'];
    rows=months.map(m=>{const c=financeCardsByMonth[m]??financeCardsByMonth['Mar'];const paid=(financePieByMonth[m]??[]).find(x=>x.name==='Paid')?.value??0;return[m,c.collected,c.pending,`${paid}%`,c.scholarships,c.late];});
  }
  const csv=[headers.join(','),...rows.map(r=>r.map(v=>`"${v}"`).join(','))].join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download=`MIT_Connect_${role}_${rangeLabel.replace(/[\s–→\s]/g,'_')}.csv`;
  a.click();
}

// ═══════════════════════════════════════════════════════════════════════════════
// CALENDAR RANGE PICKER POPUP
// ═══════════════════════════════════════════════════════════════════════════════
function CalendarRangePicker({ startMY, endMY, onChange, onClose }) {
  const [viewYear, setViewYear] = useState(startMY?.year ?? 2026);
  const [phase, setPhase]       = useState('start'); // 'start' | 'end'
  const [hoverIdx, setHoverIdx] = useState(null);
  const [tempStart, setTempStart] = useState(startMY);

  const startKey = startMY ? myToKey(startMY) : null;
  const endKey   = endMY   ? myToKey(endMY)   : null;

  function clickMonth(mi) {
    const my = { month: mi, year: viewYear };
    const k  = myToKey(my);
    if (phase === 'start') {
      setTempStart(my);
      onChange({ startMY: my, endMY: my });
      setPhase('end');
    } else {
      const sk = myToKey(tempStart);
      if (k < sk) { onChange({ startMY: my, endMY: tempStart }); }
      else        { onChange({ startMY: tempStart, endMY: my }); }
      setPhase('start');
      onClose();
    }
  }

  function cellStyle(mi) {
    const k = myToKey({ month: mi, year: viewYear });
    const sk = tempStart ? myToKey(tempStart) : startKey;
    const ek = phase === 'end' && hoverIdx !== null
      ? myToKey({ month: hoverIdx, year: viewYear })
      : endKey;
    const lo = sk != null && ek != null ? Math.min(sk, ek) : null;
    const hi = sk != null && ek != null ? Math.max(sk, ek) : null;
    const inRange  = lo != null && k >= lo && k <= hi;
    const isStart  = sk != null && k === sk;
    const isEnd    = ek != null && k === ek;
    const isEdge   = isStart || isEnd;

    return {
      width: '100%', height: 40, borderRadius: 8, border: 'none',
      fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.1s',
      background: isEdge ? '#2563eb' : inRange ? '#dbeafe' : 'transparent',
      color: isEdge ? '#fff' : inRange ? '#1e40af' : '#374151',
      boxShadow: isEdge ? '0 2px 8px rgba(37,99,235,.3)' : 'none',
    };
  }

  return (
    <div style={{
      position:'absolute', zIndex:1100, top:'calc(100% + 10px)', left:0,
      background:'#fff', borderRadius:18, border:'1.5px solid #e5e7eb',
      boxShadow:'0 12px 40px rgba(0,0,0,.16)', padding:22, minWidth:320,
    }}>
      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={()=>setViewYear(y=>y-1)} style={navBtn}><Ico.ChevL /></button>
          <select value={viewYear} onChange={e=>setViewYear(Number(e.target.value))} style={{ border:'1.5px solid #e5e7eb', borderRadius:7, padding:'2px 6px', fontWeight:700, fontSize:14, color:'#111827', cursor:'pointer', outline:'none' }}>
            {YEARS.map(y=><option key={y}>{y}</option>)}
          </select>
          <button onClick={()=>setViewYear(y=>y+1)} style={navBtn}><Ico.ChevR /></button>
        </div>
        <div style={{ fontSize:12, fontWeight:600, color: phase==='start'?'#2563eb':'#f97316', background: phase==='start'?'#eff6ff':'#fff7ed', padding:'3px 10px', borderRadius:999, border:`1px solid ${phase==='start'?'#bfdbfe':'#fed7aa'}` }}>
          {phase === 'start' ? '① Click start month' : '② Click end month'}
        </div>
        <button onClick={onClose} style={{ ...navBtn, color:'#6b7280' }}><Ico.Close /></button>
      </div>

      {/* Month grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6 }}>
        {MONTHS_ALL.map((m, mi) => (
          <button
            key={m}
            style={cellStyle(mi)}
            onClick={() => clickMonth(mi)}
            onMouseEnter={() => phase==='end' && setHoverIdx(mi)}
            onMouseLeave={() => setHoverIdx(null)}
          >{m}</button>
        ))}
      </div>

      {/* Selection display */}
      {startMY && endMY && (
        <div style={{ marginTop:14, padding:'8px 14px', background:'#f0fdf4', borderRadius:10, border:'1px solid #bbf7d0', fontSize:12, fontWeight:700, color:'#15803d', textAlign:'center' }}>
          {myLabel(startMY) === myLabel(endMY)
            ? `📅 ${myLabel(startMY)}`
            : `📅 ${myLabel(startMY)}  →  ${myLabel(endMY)}`}
        </div>
      )}
    </div>
  );
}
const navBtn = { width:28, height:28, borderRadius:7, border:'1px solid #e5e7eb', background:'#f9fafb', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#374151' };

// ─── Shared UI atoms ──────────────────────────────────────────────────────────
function SCard({ label, value, sub, tone, icon, trend }) {
  return (
    <div className={`stat-card stat-card-${tone}`}>
      <div className="stat-body">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            <div className="stat-sub" style={{ display:'flex', alignItems:'center', gap:3, marginTop:3 }}>
              {trend==='up'   && <span style={{ color:'#22c55e', display:'flex' }}><Ico.Up /></span>}
              {trend==='down' && <span style={{ color:'#ef4444', display:'flex' }}><Ico.Down /></span>}
              {sub}
            </div>
          </div>
          <span style={{ fontSize:24, opacity:.5, marginTop:2 }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

function CC({ title, subtitle, children, span2, style }) {
  return (
    <div className="content-card" style={{ marginBottom:0, gridColumn:span2?'span 2':'span 1', ...style }}>
      <div className="section-header" style={{ marginBottom:14 }}>
        <div>
          <span className="section-title">{title}</span>
          {subtitle && <p style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function IRow({ children, bg }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', borderRadius:9, background:bg||'#f9fafb', border:'1px solid #f3f4f6', marginBottom:7, gap:8, flexWrap:'wrap' }}>
      {children}
    </div>
  );
}

function GBadge({ grade }) {
  const m = { O:'#15803d','A+':'#1d4ed8',A:'#2563eb','B+':'#7c3aed',B:'#d97706',F:'#b91c1c' };
  return <span style={{ fontSize:12, fontWeight:800, padding:'2px 9px', borderRadius:999, background:'#f3f4f6', color:m[grade]||'#6b7280' }}>{grade}</span>;
}

function InsCard({ title, children }) {
  return (
    <div className="content-card" style={{ marginBottom:0 }}>
      <div style={{ fontSize:14, fontWeight:700, color:'#1f2937', marginBottom:12 }}>{title}</div>
      {children}
    </div>
  );
}

const tH = { fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:.4, padding:'6px 10px', textAlign:'left', whiteSpace:'nowrap' };
const tD = { fontSize:13, padding:'9px 10px', verticalAlign:'middle', borderBottom:'1px solid #f9fafb' };

function InsightSection({ role: r }) {
  const ins = INSIGHTS[r];
  const hdr = (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
      <span style={{ fontSize:16 }}>💡</span>
      <span className="section-title">Detailed Insights</span>
    </div>
  );

  if (r === 'student') return (
    <div>{hdr}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20 }}>
        <InsCard title="⚠️ Subjects to Improve">
          {ins.improvement.map((s,i)=>(
            <IRow key={i} bg={s.risk==='high'?'#fff5f5':'#fffbeb'}>
              <div><div style={{ fontWeight:700, fontSize:13 }}>{s.subject}</div><div style={{ fontSize:11, color:'#9ca3af' }}>Att: {s.attendance} · Grade: {s.lastGrade}</div></div>
              <span style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:999, background:s.risk==='high'?'#fef2f2':'#fff7ed', color:s.risk==='high'?'#b91c1c':'#c2410c', textTransform:'uppercase' }}>{s.risk}</span>
            </IRow>
          ))}
        </InsCard>
        <InsCard title="📊 Recent Grades">
          {ins.recentGrades.map((g,i)=>(
            <IRow key={i}>
              <div><div style={{ fontWeight:600, fontSize:13 }}>{g.subject}</div><div style={{ fontSize:11, color:'#9ca3af' }}>{g.date} · Score: {g.score}</div></div>
              <GBadge grade={g.grade} />
            </IRow>
          ))}
        </InsCard>
        <InsCard title="📅 Upcoming Deadlines">
          {ins.deadlines.map((d,i)=>(
            <IRow key={i} bg={d.status==='pending'?'#fffbeb':undefined}>
              <div><div style={{ fontWeight:600, fontSize:13 }}>{d.title}</div><div style={{ fontSize:11, color:'#9ca3af' }}>Due: {d.due}</div></div>
              <span style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:999, background:d.status==='pending'?'#fff7ed':'#eff6ff', color:d.status==='pending'?'#c2410c':'#1d4ed8', textTransform:'uppercase' }}>{d.status}</span>
            </IRow>
          ))}
        </InsCard>
      </div>
    </div>
  );

  if (r === 'faculty') return (
    <div>{hdr}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20 }}>
        <InsCard title="⚠️ Low Attendance Students">
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr><th style={tH}>Name</th><th style={tH}>Course</th><th style={tH}>%</th></tr></thead>
            <tbody>{ins.lowAttendance.map((s,i)=>(
              <tr key={i}>
                <td style={tD}><div style={{ fontWeight:600, fontSize:12 }}>{s.name}</div><div style={{ fontSize:10, color:'#9ca3af' }}>{s.rollNo}</div></td>
                <td style={{ ...tD, fontSize:11, color:'#6b7280' }}>{s.course}</td>
                <td style={tD}><span style={{ fontWeight:800, fontSize:13, color:'#ef4444' }}>{s.att}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </InsCard>
        <InsCard title="📋 Missing Assignments">
          {ins.missingAssign.map((s,i)=>(
            <IRow key={i} bg="#fff5f5">
              <div><div style={{ fontWeight:700, fontSize:13 }}>{s.name}</div><div style={{ fontSize:11, color:'#9ca3af' }}>{s.rollNo} · {s.course}</div></div>
              <span style={{ fontWeight:800, fontSize:12, color:'#b91c1c', background:'#fef2f2', padding:'3px 9px', borderRadius:999 }}>{s.missing} missing</span>
            </IRow>
          ))}
        </InsCard>
        <InsCard title="🏆 Top Students">
          {ins.topStudents.map((s,i)=>(
            <IRow key={i} bg={i===0?'#fffbeb':undefined}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>{['🥇','🥈','🥉'][i]}</span>
                <div><div style={{ fontWeight:700, fontSize:13 }}>{s.name}</div><div style={{ fontSize:11, color:'#9ca3af' }}>{s.rollNo}</div></div>
              </div>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}><span style={{ fontSize:12, color:'#6b7280' }}>{s.avg}</span><GBadge grade={s.grade}/></div>
            </IRow>
          ))}
        </InsCard>
      </div>
    </div>
  );

  if (r === 'admin') return (
    <div>{hdr}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20 }}>
        <InsCard title="⚠️ Low Attendance">
          {ins.lowAtt.map((d,i)=>(
            <IRow key={i} bg="#fff5f5">
              <div><div style={{ fontWeight:700, fontSize:13 }}>{d.dept}</div><div style={{ fontSize:11, color:'#9ca3af' }}>Threshold: {d.threshold}</div></div>
              <span style={{ fontWeight:800, fontSize:13, color:'#ef4444' }}>{d.count} students</span>
            </IRow>
          ))}
        </InsCard>
        <InsCard title="🏆 Top Departments">
          {ins.topDepts.map((d,i)=>(
            <IRow key={i} bg={i===0?'#fffbeb':undefined}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>{['🥇','🥈','🥉'][i]}</span>
                <div><div style={{ fontWeight:700, fontSize:13 }}>{d.dept}</div><div style={{ fontSize:11, color:'#9ca3af' }}>Pass: {d.passRate}</div></div>
              </div>
              <span style={{ fontWeight:700, fontSize:13, color:'#2563eb' }}>{d.avgScore}</span>
            </IRow>
          ))}
        </InsCard>
        <InsCard title="🎓 New Admissions">
          {ins.newAdmissions.map((a,i)=>(
            <IRow key={i}>
              <div><div style={{ fontWeight:600, fontSize:13 }}>{a.name}</div><div style={{ fontSize:11, color:'#9ca3af' }}>{a.date}</div></div>
              <span style={{ fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:999, background:'#eff6ff', color:'#2563eb' }}>{a.dept}</span>
            </IRow>
          ))}
        </InsCard>
      </div>
    </div>
  );

  if (r === 'finance') return (
    <div>{hdr}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:20 }}>
        <InsCard title="⏳ Pending Fees">
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr><th style={tH}>Student</th><th style={tH}>Dept</th><th style={tH}>Amount</th><th style={tH}>Due</th></tr></thead>
            <tbody>{ins.pendingStudents.map((s,i)=>(
              <tr key={i}>
                <td style={tD}><div style={{ fontWeight:600, fontSize:12 }}>{s.name}</div><div style={{ fontSize:10, color:'#9ca3af' }}>{s.rollNo}</div></td>
                <td style={tD}><span style={{ background:'#eff6ff', color:'#2563eb', padding:'2px 7px', borderRadius:999, fontWeight:700, fontSize:11 }}>{s.dept}</span></td>
                <td style={{ ...tD, fontWeight:700, color:'#c2410c', fontSize:12 }}>{s.amount}</td>
                <td style={{ ...tD, fontSize:11, color:'#9ca3af' }}>{s.due}</td>
              </tr>
            ))}</tbody>
          </table>
        </InsCard>
        <InsCard title="🏆 Top Collecting Depts">
          {ins.topDepts.map((d,i)=>(
            <IRow key={i} bg={i===0?'#fffbeb':undefined}>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}><span>{['🥇','🥈','🥉'][i]}</span><div><div style={{ fontWeight:700, fontSize:13 }}>{d.dept}</div><div style={{ fontSize:11, color:'#9ca3af' }}>Rate: {d.rate}</div></div></div>
              <span style={{ fontWeight:700, fontSize:13, color:'#16a34a' }}>{d.collected}</span>
            </IRow>
          ))}
        </InsCard>
        <InsCard title="🔴 Overdue Payments">
          {ins.overdue.map((o,i)=>(
            <IRow key={i} bg="#fff5f5">
              <div><div style={{ fontWeight:700, fontSize:13 }}>{o.name}</div><div style={{ fontSize:11, color:'#9ca3af' }}>{o.rollNo}</div></div>
              <div style={{ textAlign:'right' }}><div style={{ fontWeight:800, fontSize:12, color:'#b91c1c' }}>{o.amount}</div><div style={{ fontSize:10, color:'#ef4444' }}>{o.days}d overdue</div></div>
            </IRow>
          ))}
        </InsCard>
      </div>
    </div>
  );

  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function AnalyticsPage({ role: propRole }) {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [calOpen,     setCalOpen]     = useState(false);
  const calRef = useRef(null);

  const storedRole = localStorage.getItem('cmsRole') || 'student';
  const role       = getValidRole(propRole || searchParams.get('role') || storedRole);
  const data       = cmsRoles[role];
  const menuGroups = roleMenuGroups[role] || roleMenuGroups.student;

  const [startMY, setStartMY] = useState({ month:0, year:2026 }); // Jan 2026
  const [endMY,   setEndMY]   = useState({ month:2, year:2026 }); // Mar 2026
  const [semester,   setSemester]   = useState(SEMESTER_OPTS[0]);
  const [department, setDepartment] = useState(role==='student'?COURSE_OPTS[0]:DEPT_OPTS[0]);

  // Close calendar on outside click
  useEffect(() => {
    function onOut(e){ if(calRef.current&&!calRef.current.contains(e.target))setCalOpen(false); }
    if(calOpen)document.addEventListener('mousedown',onOut);
    return()=>document.removeEventListener('mousedown',onOut);
  },[calOpen]);

  // Months in range
  const activeMonths = useMemo(() => {
    const sk=myToKey(startMY), ek=myToKey(endMY), lo=Math.min(sk,ek), hi=Math.max(sk,ek);
    const res=[];
    for(let k=lo;k<=hi;k++){ const {month}=keyToMY(k); res.push(MONTHS_ALL[month]); }
    return [...new Set(res)];
  },[startMY,endMY]);

  const rangeLabel = myToKey(startMY)===myToKey(endMY) ? myLabel(startMY) : `${myLabel(startMY)} – ${myLabel(endMY)}`;
  const lastMonth  = activeMonths[activeMonths.length-1];

  // Derived data
  const sAttData    = useMemo(()=>avgAttSubject(activeMonths),[activeMonths]);
  const sMarksData  = useMemo(()=>activeMonths.flatMap(m=>(studentMarksByMonth[m]??[]).map(d=>({...d,test:`${m}-${d.test}`}))),[activeMonths]);
  const sAssignData = useMemo(()=>activeMonths.flatMap(m=>(studentAssignByMonth[m]??[]).map(d=>({...d,week:`${m} ${d.week}`}))),[activeMonths]);
  const sCards      = useMemo(()=>({att:avgCardField(studentCardsByMonth,activeMonths,'att'),assign:avgCardField(studentCardsByMonth,activeMonths,'assign'),cgpa:avgCardField(studentCardsByMonth,activeMonths,'cgpa'),exams:avgCardField(studentCardsByMonth,activeMonths,'exams')}),[activeMonths]);
  const fAttData    = useMemo(()=>activeMonths.flatMap(m=>(facultyAttByMonth[m]??[]).map(d=>({...d,week:`${m} ${d.week}`}))),[activeMonths]);
  const fSubData    = useMemo(()=>activeMonths.flatMap(m=>(facultySubByMonth[m]??[]).map(d=>({...d,week:`${m} ${d.week}`}))),[activeMonths]);
  const fCards      = useMemo(()=>({students:avgCardField(facultyCardsByMonth,activeMonths,'students'),att:avgCardField(facultyCardsByMonth,activeMonths,'att'),submitted:avgCardField(facultyCardsByMonth,activeMonths,'submitted'),pending:avgCardField(facultyCardsByMonth,activeMonths,'pending')}),[activeMonths]);
  const fMarksDist  = useMemo(()=>avgMarksDist(activeMonths),[activeMonths]);
  const aAttData    = useMemo(()=>avgAdminAtt(activeMonths),[activeMonths]);
  const aExamData   = useMemo(()=>avgAdminExam(activeMonths),[activeMonths]);
  const aCards      = useMemo(()=>({students:avgCardField(adminCardsByMonth,activeMonths,'students'),faculty:avgCardField(adminCardsByMonth,activeMonths,'faculty'),depts:adminCardsByMonth[lastMonth]?.depts??'5',courses:avgCardField(adminCardsByMonth,activeMonths,'courses')}),[activeMonths,lastMonth]);
  const fiColData   = useMemo(()=>activeMonths.flatMap(m=>(financeColByMonth[m]??[]).map(d=>({...d,week:`${m} ${d.week}`}))),[activeMonths]);
  const fiPieData   = useMemo(()=>avgFinancePie(activeMonths),[activeMonths]);
  const fiDeptData  = useMemo(()=>avgFinanceDept(activeMonths),[activeMonths]);
  const fiCards     = useMemo(()=>({collected:financeCardsByMonth[lastMonth]?.collected??'—',pending:financeCardsByMonth[lastMonth]?.pending??'—',scholarships:avgCardField(financeCardsByMonth,activeMonths,'scholarships'),late:avgCardField(financeCardsByMonth,activeMonths,'late')}),[activeMonths,lastMonth]);

  useEffect(()=>{ document.title=`MIT Connect – ${data.label} Analytics`; localStorage.setItem('cmsRole',role); },[data.label,role]);
  function handleLogout(){ localStorage.removeItem('cmsRole'); localStorage.removeItem('cmsUserId'); navigate('/'); }

  const triggerLabel = myToKey(startMY)===myToKey(endMY) ? myLabel(startMY) : `${myLabel(startMY)} → ${myLabel(endMY)}`;

  // ─── Filter bar ──────────────────────────────────────────────────────────────
  function FilterBar() {
    return (
      <div className="content-card" style={{ marginBottom:24, padding:'16px 20px' }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:12, flexWrap:'wrap' }}>

          {/* Calendar trigger */}
          <div style={{ position:'relative' }} ref={calRef}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:.5, marginBottom:5, display:'flex', alignItems:'center', gap:4 }}>
              <Ico.Calendar /> Date Range
            </div>
            <button
              onClick={()=>setCalOpen(o=>!o)}
              style={{
                display:'flex', alignItems:'center', gap:8, height:38, padding:'0 14px',
                borderRadius:9, border:`1.5px solid ${calOpen?'#2563eb':'#e5e7eb'}`,
                background: calOpen?'#eff6ff':'#fff', color:'#1f2937',
                fontSize:13, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap',
                boxShadow: calOpen?'0 0 0 3px rgba(37,99,235,.12)':'none', transition:'all 0.15s',
              }}
            >
              <Ico.Calendar />
              {triggerLabel}
              <span style={{ fontSize:10, color:'#9ca3af', marginLeft:2 }}>▾</span>
            </button>

            {calOpen && (
              <CalendarRangePicker
                startMY={startMY}
                endMY={endMY}
                onChange={({startMY:s,endMY:e})=>{ setStartMY(s); setEndMY(e); }}
                onClose={()=>setCalOpen(false)}
              />
            )}
          </div>

          {/* Semester */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:.5, marginBottom:5 }}>Semester</div>
            <select value={semester} onChange={e=>setSemester(e.target.value)} style={{ height:38, padding:'0 10px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', fontSize:13, fontWeight:600, color:'#374151', cursor:'pointer', outline:'none', appearance:'none', WebkitAppearance:'none', minWidth:170 }}>
              {SEMESTER_OPTS.map(o=><option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Dept / Course */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:.5, marginBottom:5 }}>{role==='student'?'Course':'Department'}</div>
            <select value={department} onChange={e=>setDepartment(e.target.value)} style={{ height:38, padding:'0 10px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#fff', fontSize:13, fontWeight:600, color:'#374151', cursor:'pointer', outline:'none', appearance:'none', WebkitAppearance:'none', minWidth:170 }}>
              {(role==='student'?COURSE_OPTS:DEPT_OPTS).map(o=><option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Reset */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:'transparent', marginBottom:5 }}>—</div>
            <button onClick={()=>{ setStartMY({month:0,year:2026}); setEndMY({month:2,year:2026}); setSemester(SEMESTER_OPTS[0]); setDepartment(role==='student'?COURSE_OPTS[0]:DEPT_OPTS[0]); }} style={{ height:38, padding:'0 14px', borderRadius:9, border:'1.5px solid #e5e7eb', background:'#f9fafb', color:'#6b7280', fontSize:12, fontWeight:600, cursor:'pointer' }}>Reset</button>
          </div>

          {/* Download Report */}
          <div style={{ marginLeft:'auto' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'transparent', marginBottom:5 }}>—</div>
            <button
              onClick={()=>exportCSV(role,activeMonths,rangeLabel)}
              style={{ display:'flex', alignItems:'center', gap:7, height:38, padding:'0 18px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#2563eb,#1d4ed8)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 2px 10px rgba(37,99,235,.4)' }}
            >
              <Ico.Download /> Download Report
            </button>
          </div>
        </div>

        {/* Pills */}
        <div style={{ display:'flex', gap:6, marginTop:12, flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ fontSize:11, color:'#9ca3af' }}>Showing:</span>
          <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:999, background:'#eff6ff', color:'#2563eb', border:'1px solid #bfdbfe' }}>{triggerLabel}</span>
          <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:999, background:'#f5f3ff', color:'#7c3aed', border:'1px solid #ddd6fe' }}>{semester}</span>
          <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:999, background:'#f0fdf4', color:'#16a34a', border:'1px solid #bbf7d0' }}>{department}</span>
          {activeMonths.length>1 && <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:999, background:'#fff7ed', color:'#c2410c', border:'1px solid #fed7aa' }}>{activeMonths.length} months</span>}
        </div>
      </div>
    );
  }

  // ─── Role content ──────────────────────────────────────────────────────────────
  function StudentView() {
    return (
      <>
        <div className="stats-grid" style={{ marginBottom:24 }}>
          {[{label:'Attendance',value:sCards.att,sub:rangeLabel,tone:'blue',icon:'📅',trend:'up'},{label:'Assignments',value:sCards.assign,sub:rangeLabel,tone:'green',icon:'✅',trend:'up'},{label:'CGPA',value:sCards.cgpa,sub:semester,tone:'purple',icon:'🎯',trend:'up'},{label:'Upcoming Exams',value:sCards.exams,sub:rangeLabel,tone:'orange',icon:'📝',trend:null}].map(c=><SCard key={c.label} {...c} />)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
          <CC title="📊 Attendance per Subject" subtitle={`${rangeLabel} — avg`}>
            <ResponsiveContainer width="100%" height={H}>
              <BarChart data={sAttData} margin={{ top:4,right:4,left:-20,bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="subject" tick={{ fontSize:10,fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fontSize:11,fill:'#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
                <Tooltip {...TT} formatter={v=>`${v}%`} />
                <Bar dataKey="pct" name="Attendance%" radius={[6,6,0,0]}>
                  {sAttData.map((d,i)=><Cell key={i} fill={d.pct<75?C.red:d.pct<85?C.orange:C.blue}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', gap:14, marginTop:8, fontSize:11, color:'#6b7280' }}>
              {[['#ef4444','<75%'],['#f97316','75–84%'],['#2563eb','85%+']].map(([col,lbl])=>(
                <span key={lbl}><span style={{ display:'inline-block',width:8,height:8,borderRadius:2,background:col,marginRight:4 }}/>{lbl}</span>
              ))}
            </div>
          </CC>
          <CC title="📈 Marks Progress" subtitle={`Tests in ${rangeLabel}`}>
            <ResponsiveContainer width="100%" height={H}>
              <LineChart data={sMarksData} margin={{ top:4,right:4,left:-20,bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="test" tick={{ fontSize:9,fill:'#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={[40,100]} tick={{ fontSize:11,fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip {...TT} />
                <Legend wrapperStyle={{ fontSize:12 }} />
                <Line type="monotone" dataKey="DBMS" stroke={C.blue}   strokeWidth={2} dot={{ r:3 }}/>
                <Line type="monotone" dataKey="DS"   stroke={C.cyan}   strokeWidth={2} dot={{ r:3 }}/>
                <Line type="monotone" dataKey="Phy"  stroke={C.orange} strokeWidth={2} dot={{ r:3 }}/>
                <Line type="monotone" dataKey="Math" stroke={C.green}  strokeWidth={2} dot={{ r:3 }}/>
              </LineChart>
            </ResponsiveContainer>
          </CC>
          <CC title="✅ Assignment Completion" subtitle={`Week-by-week in ${rangeLabel}`} span2>
            <ResponsiveContainer width="100%" height={H}>
              <BarChart data={sAssignData} margin={{ top:4,right:4,left:-20,bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" tick={{ fontSize:9,fill:'#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize:11,fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip {...TT} />
                <Legend wrapperStyle={{ fontSize:12 }} />
                <Bar dataKey="completed" name="Completed" stackId="a" fill={C.green}  radius={[0,0,0,0]}/>
                <Bar dataKey="pending"   name="Pending"   stackId="a" fill={C.orange} radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </CC>
        </div>
        <InsightSection role="student" />
      </>
    );
  }

  function FacultyView() {
    return (
      <>
        <div className="stats-grid" style={{ marginBottom:24 }}>
          {[{label:'Students in Class',value:fCards.students,sub:rangeLabel,tone:'blue',icon:'👥',trend:null},{label:'Avg Attendance',value:fCards.att,sub:rangeLabel,tone:'green',icon:'📅',trend:'up'},{label:'Assignments Submitted',value:fCards.submitted,sub:rangeLabel,tone:'purple',icon:'📋',trend:'up'},{label:'Pending',value:fCards.pending,sub:'Avg / mo',tone:'orange',icon:'⚠️',trend:'down'}].map(c=><SCard key={c.label} {...c} />)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:24 }}>
          <CC title="📅 Weekly Attendance Trend" subtitle={`${rangeLabel} — per course`}>
            <ResponsiveContainer width="100%" height={H}>
              <LineChart data={fAttData} margin={{ top:4,right:4,left:-20,bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" tick={{ fontSize:9,fill:'#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={[65,100]} tick={{ fontSize:11,fill:'#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
                <Tooltip {...TT} formatter={v=>`${v}%`} />
                <Legend wrapperStyle={{ fontSize:12 }} />
                <Line type="monotone" dataKey="CS6001" stroke={C.blue}   strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="CS6002" stroke={C.cyan}   strokeWidth={2} dot={false}/>
                <Line type="monotone" dataKey="Phy"    stroke={C.orange} strokeWidth={2} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </CC>
          <CC title="📋 Submission Rate" subtitle={`${rangeLabel}`}>
            <ResponsiveContainer width="100%" height={H}>
              <BarChart data={fSubData} margin={{ top:4,right:4,left:-20,bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" tick={{ fontSize:9,fill:'#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize:11,fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip {...TT} />
                <Legend wrapperStyle={{ fontSize:12 }} />
                <Bar dataKey="onTime"  name="On Time" stackId="a" fill={C.green}  radius={[0,0,0,0]}/>
                <Bar dataKey="late"    name="Late"    stackId="a" fill={C.orange} radius={[0,0,0,0]}/>
                <Bar dataKey="missing" name="Missing" stackId="a" fill={C.red}    radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </CC>
          <CC title="📊 Marks Distribution" subtitle={`Avg grade breakdown — ${rangeLabel}`} span2>
            <ResponsiveContainer width="100%" height={H}>
              <BarChart data={fMarksDist} margin={{ top:4,right:4,left:-20,bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="range" tick={{ fontSize:11,fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11,fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip {...TT} />
                <Bar dataKey="count" name="Students" radius={[6,6,0,0]}>
                  {fMarksDist.map((_,i)=><Cell key={i} fill={[C.green,C.blue,C.cyan,C.purple,C.orange,C.red][i]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CC>
        </div>
        <InsightSection role="faculty" />
      </>
    );
  }

  function AdminView() {
    // Extra derived data for new charts
    const deptTrendData = MONTHS_ALL.map(mn => {
      const row = { month: mn };
      ['CS','Phys','Math','ECE','Mech'].forEach(d => {
        const found = (adminAttByMonth[mn]??[]).find(x=>x.dept===d);
        row[d] = found?.avg ?? 0;
      });
      return row;
    });

    const deptPassTrendData = MONTHS_ALL.map(mn => {
      const row = { month: mn };
      ['CS','Phys','Math','ECE','Mech'].forEach(d => {
        const found = (adminExamByMonth[mn]??[]).find(x=>x.dept===d);
        row[d] = found?.pass ?? 0;
      });
      return row;
    });

    const rankingData = (() => {
      const depts = ['CS','Phys','Math','ECE','Mech'];
      return depts.map(d => {
        const att  = Math.round(activeMonths.reduce((s,m)=>{ const f=(adminAttByMonth[m]??[]).find(x=>x.dept===d); return s+(f?.avg??0); },0)/activeMonths.length);
        const pass = Math.round(activeMonths.reduce((s,m)=>{ const f=(adminExamByMonth[m]??[]).find(x=>x.dept===d); return s+(f?.pass??0); },0)/activeMonths.length);
        const score = Math.round((att*0.4)+(pass*0.6));
        return { dept:d, att, pass, score };
      }).sort((a,b)=>b.score-a.score);
    })();

    // Month-over-month change for summary cards
    const prevMonth = activeMonths.length>1 ? activeMonths[activeMonths.length-2] : activeMonths[0];
    const currMonth = activeMonths[activeMonths.length-1];
    const attChange = Math.round(
      (adminAttByMonth[currMonth]??[]).reduce((s,d)=>s+d.avg,0)/5 -
      (adminAttByMonth[prevMonth]??[]).reduce((s,d)=>s+d.avg,0)/5
    );
    const passChange = Math.round(
      (adminExamByMonth[currMonth]??[]).reduce((s,d)=>s+d.pass,0)/5 -
      (adminExamByMonth[prevMonth]??[]).reduce((s,d)=>s+d.pass,0)/5
    );

    const DEPT_COLORS = { CS:C.blue, Phys:C.orange, Math:C.green, ECE:C.purple, Mech:C.cyan };

    return (
      <>
        {/* ── Stat cards ── */}
        <div className="stats-grid" style={{ marginBottom:24 }}>
          {[
            {label:'Total Students', value:aCards.students, sub:rangeLabel,       tone:'blue',   icon:'🎓', trend:'up'},
            {label:'Total Faculty',  value:aCards.faculty,  sub:rangeLabel,       tone:'green',  icon:'👨‍🏫',trend:null},
            {label:'Avg Attendance', value:`${Math.round(activeMonths.reduce((s,m)=>{const r=(adminAttByMonth[m]??[]);return s+r.reduce((a,d)=>a+d.avg,0)/(r.length||1);},0)/activeMonths.length)}%`,
              sub: attChange>=0?`▲ ${attChange}% vs prev`:`▼ ${Math.abs(attChange)}% vs prev`,
              tone: attChange>=0?'purple':'orange', icon:'📅', trend: attChange>=0?'up':'down'},
            {label:'Avg Pass Rate', value:`${Math.round(activeMonths.reduce((s,m)=>{const r=(adminExamByMonth[m]??[]);return s+r.reduce((a,d)=>a+d.pass,0)/(r.length||1);},0)/activeMonths.length)}%`,
              sub: passChange>=0?`▲ ${passChange}% vs prev`:`▼ ${Math.abs(passChange)}% vs prev`,
              tone: passChange>=0?'green':'orange', icon:'✅', trend: passChange>=0?'up':'down'},
          ].map(c=><SCard key={c.label} {...c} />)}
        </div>

        {/* ── Alert banner ── */}
        {rankingData.some(d=>d.att<80) && (
          <div style={{ display:'flex', gap:10, alignItems:'center', padding:'12px 18px', borderRadius:12, background:'#fff7ed', border:'1.5px solid #fed7aa', marginBottom:20 }}>
            <span style={{ fontSize:20 }}>⚠️</span>
            <div>
              <div style={{ fontWeight:700, fontSize:13, color:'#92400e' }}>Attendance Alert</div>
              <div style={{ fontSize:12, color:'#b45309' }}>
                {rankingData.filter(d=>d.att<80).map(d=>`${d.dept} (${d.att}%)`).join(', ')} below 80% threshold
              </div>
            </div>
          </div>
        )}

        {/* ── Row 1: Att bar + Exam bar ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
          <CC title="📅 Dept-wise Attendance" subtitle={`Avg % — ${rangeLabel}`}>
            <ResponsiveContainer width="100%" height={H}>
              <BarChart data={!DEPT_CODE[department]?aAttData:aAttData.filter(d=>d.dept===DEPT_CODE[department])} margin={{ top:4,right:4,left:-20,bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="dept" tick={{ fontSize:11,fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[60,100]} tick={{ fontSize:11,fill:'#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
                <Tooltip {...TT} formatter={v=>`${v}%`} />
                <Bar dataKey="avg" name="Avg Attendance" radius={[6,6,0,0]}>
                  {(!DEPT_CODE[department]?aAttData:aAttData.filter(d=>d.dept===DEPT_CODE[department])).map((d,i)=><Cell key={i} fill={d.avg<80?C.red:d.avg<85?C.orange:C.blue}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CC>
          <CC title="📝 Exam Pass vs Fail" subtitle={`% breakdown — ${rangeLabel}`}>
            <ResponsiveContainer width="100%" height={H}>
              <BarChart data={!DEPT_CODE[department]?aExamData:aExamData.filter(d=>d.dept===DEPT_CODE[department])} margin={{ top:4,right:4,left:-20,bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="dept" tick={{ fontSize:11,fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fontSize:11,fill:'#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
                <Tooltip {...TT} formatter={v=>`${v}%`} />
                <Legend wrapperStyle={{ fontSize:12 }} />
                <Bar dataKey="pass" name="Pass%" stackId="a" fill={C.green} radius={[0,0,0,0]}/>
                <Bar dataKey="fail" name="Fail%" stackId="a" fill={C.red}   radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </CC>
        </div>

        {/* ── Row 2: 12-month att trend (all depts) + Rankings table ── */}
        <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:20, marginBottom:20 }}>
          <CC title="📈 Attendance Trend by Department" subtitle="All 12 months — per dept line">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={deptTrendData} margin={{ top:4,right:4,left:-20,bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize:10,fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[65,100]} tick={{ fontSize:10,fill:'#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
                <Tooltip {...TT} formatter={v=>`${v}%`} />
                <Legend wrapperStyle={{ fontSize:11 }} />
                {Object.entries(DEPT_COLORS).map(([d,col])=>(
                  <Line key={d} type="monotone" dataKey={d} stroke={col} strokeWidth={1.8} dot={false}
                    strokeDasharray={activeMonths.includes('Jan')?undefined:'4 2'}/>
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CC>

          <CC title="🏆 Department Rankings" subtitle={`Composite score (att 40% + pass 60%) — ${rangeLabel}`}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...tH, paddingLeft:6 }}>#</th>
                  <th style={tH}>Dept</th>
                  <th style={tH}>Att%</th>
                  <th style={tH}>Pass%</th>
                  <th style={tH}>Score</th>
                </tr>
              </thead>
              <tbody>
                {rankingData.map((d,i)=>(
                  <tr key={d.dept} style={{ background: i===0?'#fffbeb':i===1?'#f0fdf4':'#fff' }}>
                    <td style={{ ...tD, paddingLeft:8, fontSize:16 }}>{['🥇','🥈','🥉','4','5'][i]}</td>
                    <td style={{ ...tD, fontWeight:700 }}>
                      <span style={{ display:'inline-block', width:8, height:8, borderRadius:2, background:DEPT_COLORS[d.dept], marginRight:6 }}/>
                      {d.dept}
                    </td>
                    <td style={tD}>
                      <span style={{ fontWeight:700, color: d.att<80?C.red:d.att<85?C.orange:C.green }}>{d.att}%</span>
                    </td>
                    <td style={tD}>
                      <span style={{ fontWeight:700, color: d.pass<80?C.red:d.pass<88?C.orange:C.green }}>{d.pass}%</span>
                    </td>
                    <td style={tD}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ flex:1, height:6, borderRadius:3, background:'#f3f4f6', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${d.score}%`, background: i===0?C.orange:i===1?C.green:C.blue, borderRadius:3 }}/>
                        </div>
                        <span style={{ fontSize:11, fontWeight:700, color:'#374151', minWidth:28 }}>{d.score}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CC>
        </div>

        {/* ── Row 3: Pass rate trend (all depts) + Monthly summary table ── */}
        <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:20, marginBottom:20 }}>
          <CC title="📊 Pass Rate Trend by Department" subtitle="All 12 months — per dept line">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={deptPassTrendData} margin={{ top:4,right:4,left:-20,bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize:10,fill:'#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[60,100]} tick={{ fontSize:10,fill:'#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`} />
                <Tooltip {...TT} formatter={v=>`${v}%`} />
                <Legend wrapperStyle={{ fontSize:11 }} />
                {Object.entries(DEPT_COLORS).map(([d,col])=>(
                  <Line key={d} type="monotone" dataKey={d} stroke={col} strokeWidth={1.8} dot={false}/>
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CC>

          <CC title="📋 Monthly Summary" subtitle={`Key metrics per month in ${rangeLabel}`}>
            <div style={{ overflowY:'auto', maxHeight:240 }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead style={{ position:'sticky', top:0, background:'#fff', zIndex:1 }}>
                  <tr>
                    <th style={tH}>Month</th>
                    <th style={tH}>Avg Att</th>
                    <th style={tH}>Avg Pass</th>
                    <th style={tH}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMonths.map(mn => {
                    const att  = Math.round((adminAttByMonth[mn]??[]).reduce((s,d)=>s+d.avg,0)/5);
                    const pass = Math.round((adminExamByMonth[mn]??[]).reduce((s,d)=>s+d.pass,0)/5);
                    const ok   = att>=82 && pass>=85;
                    const warn = !ok && (att>=78 || pass>=80);
                    return (
                      <tr key={mn}>
                        <td style={{ ...tD, fontWeight:700 }}>{mn}</td>
                        <td style={{ ...tD, color: att<80?C.red:att<85?C.orange:C.green, fontWeight:700 }}>{att}%</td>
                        <td style={{ ...tD, color: pass<80?C.red:pass<88?C.orange:C.green, fontWeight:700 }}>{pass}%</td>
                        <td style={tD}>
                          <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999,
                            background: ok?'#f0fdf4':warn?'#fff7ed':'#fef2f2',
                            color: ok?'#16a34a':warn?'#c2410c':'#b91c1c' }}>
                            {ok?'✅ Good':warn?'⚠️ Watch':'🔴 Low'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CC>
        </div>

        {/* ── Row 4: Attendance heatmap grid ── */}
        <CC title="🗓️ Attendance Heatmap" subtitle="All depts × all months — color intensity = avg attendance %" style={{ marginBottom:20 }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ borderCollapse:'separate', borderSpacing:4, width:'100%' }}>
              <thead>
                <tr>
                  <th style={{ ...tH, width:50 }}>Dept</th>
                  {MONTHS_ALL.map(m=><th key={m} style={{ ...tH, textAlign:'center', minWidth:46 }}>{m}</th>)}
                  <th style={{ ...tH, textAlign:'center' }}>Avg</th>
                </tr>
              </thead>
              <tbody>
                {['CS','Phys','Math','ECE','Mech'].map(d => {
                  const vals = MONTHS_ALL.map(m=>(adminAttByMonth[m]??[]).find(x=>x.dept===d)?.avg??0);
                  const rowAvg = Math.round(vals.reduce((a,b)=>a+b,0)/12);
                  return (
                    <tr key={d}>
                      <td style={{ fontSize:12, fontWeight:700, color:'#374151', padding:'2px 8px' }}>
                        <span style={{ display:'inline-block', width:8, height:8, borderRadius:2, background:DEPT_COLORS[d], marginRight:5 }}/>
                        {d}
                      </td>
                      {vals.map((v,mi) => {
                        const intensity = Math.max(0, Math.min(1, (v-70)/25));
                        const inSel = activeMonths.includes(MONTHS_ALL[mi]);
                        const bg = v < 78
                          ? `rgba(239,68,68,${0.15+intensity*0.55})`
                          : v < 84
                          ? `rgba(249,115,22,${0.15+intensity*0.55})`
                          : `rgba(37,99,235,${0.12+intensity*0.55})`;
                        return (
                          <td key={mi} title={`${d} ${MONTHS_ALL[mi]}: ${v}%`} style={{
                            background: bg,
                            borderRadius:6,
                            border: inSel?'2px solid #f97316':'2px solid transparent',
                            textAlign:'center', fontSize:11, fontWeight:700,
                            color: v<78?'#b91c1c':v<84?'#c2410c':'#1e40af',
                            padding:'5px 2px', minWidth:46, cursor:'default',
                          }}>{v}%</td>
                        );
                      })}
                      <td style={{ textAlign:'center', fontSize:12, fontWeight:800,
                        color: rowAvg<80?C.red:rowAvg<85?C.orange:C.blue,
                        padding:'5px 6px' }}>{rowAvg}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display:'flex', gap:16, marginTop:10, fontSize:11, color:'#6b7280', alignItems:'center' }}>
            <span style={{ fontWeight:600 }}>Legend:</span>
            {[['rgba(239,68,68,0.5)','<78% Low'],['rgba(249,115,22,0.5)','78–84% Watch'],['rgba(37,99,235,0.5)','85%+ Good']].map(([bg,lbl])=>(
              <span key={lbl} style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ display:'inline-block', width:14, height:14, borderRadius:3, background:bg }}/>{lbl}
              </span>
            ))}
            <span style={{ marginLeft:8, color:'#f97316', fontWeight:600 }}>🟠 bordered = selected range</span>
          </div>
        </CC>

        <InsightSection role="admin" />
      </>
    );
  }

  function FinanceView() {
    return (
      <>
        <div className="stats-grid" style={{ marginBottom:24 }}>
          {[{label:'Fees Collected',value:fiCards.collected,sub:rangeLabel,tone:'blue',icon:'💰',trend:'up'},{label:'Pending Fees',value:fiCards.pending,sub:rangeLabel,tone:'orange',icon:'⏳',trend:'down'},{label:'Scholarships',value:fiCards.scholarships,sub:'Active avg',tone:'green',icon:'🎓',trend:'up'},{label:'Late Payments',value:fiCards.late,sub:'Avg / mo',tone:'purple',icon:'🔴',trend:'down'}].map(c=><SCard key={c.label} {...c} />)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20, marginBottom:24 }}>
          <CC title="💰 Weekly Fee Collection" subtitle={`${rangeLabel} — collected vs target`}>
            <ResponsiveContainer width="100%" height={H}>
              <BarChart data={fiColData} margin={{ top:4,right:4,left:-10,bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="week" tick={{ fontSize:9,fill:'#9ca3af' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize:11,fill:'#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${fmt(v)}`}/>
                <Tooltip {...TT} formatter={v=>`₹${fmt(v)}`} />
                <Legend wrapperStyle={{ fontSize:12 }} />
                <Bar dataKey="target"    name="Target"    fill="#e5e7eb" radius={[6,6,0,0]}/>
                <Bar dataKey="collected" name="Collected" fill={C.blue}  radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </CC>
          <CC title="📊 Payment Status" subtitle={`${rangeLabel} avg`}>
            <ResponsiveContainer width="100%" height={H}>
              <PieChart>
                <Pie data={fiPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={4} dataKey="value">
                  {fiPieData.map((_,i)=><Cell key={i} fill={PIE_COLS[i]}/>)}
                </Pie>
                <Tooltip {...TT} formatter={v=>`${v}%`} />
                <Legend wrapperStyle={{ fontSize:12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CC>
        </div>
        <CC title="🏫 Department-wise Fee Collection" subtitle={`${rangeLabel} avg`} style={{ marginBottom:24 }}>
          <ResponsiveContainer width="100%" height={H}>
            <BarChart data={!DEPT_CODE[department]?fiDeptData:fiDeptData.filter(d=>d.dept===DEPT_CODE[department])} margin={{ top:4,right:4,left:-20,bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="dept" tick={{ fontSize:11,fill:'#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11,fill:'#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip {...TT} />
              <Legend wrapperStyle={{ fontSize:12 }} />
              <Bar dataKey="paid"    name="Paid"    stackId="a" fill={C.green}  radius={[0,0,0,0]}/>
              <Bar dataKey="pending" name="Pending" stackId="a" fill={C.orange} radius={[0,0,0,0]}/>
              <Bar dataKey="overdue" name="Overdue" stackId="a" fill={C.red}    radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </CC>
        <CC title="📈 12-Month Collection Trend" subtitle="Range highlighted" style={{ marginBottom:24 }}>
          <ResponsiveContainer width="100%" height={H}>
            <AreaChart data={MONTHS_ALL.map(mn=>({month:mn,collected:(financeColByMonth[mn]??[]).reduce((s,d)=>s+d.collected,0)}))} margin={{ top:4,right:4,left:-10,bottom:0 }}>
              <defs>
                <linearGradient id="gFin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.blue} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={C.blue} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize:11,fill:'#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11,fill:'#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${fmt(v)}`}/>
              <Tooltip {...TT} formatter={v=>`₹${fmt(v)}`} />
              <Area type="monotone" dataKey="collected" name="Collected" stroke={C.blue} strokeWidth={2.5} fill="url(#gFin)" dot={(props)=>{
                const inRange=activeMonths.includes(props.payload?.month);
                return <circle key={props.index} cx={props.cx} cy={props.cy} r={inRange?6:3} fill={inRange?C.orange:C.blue} stroke="#fff" strokeWidth={2}/>;
              }}/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ fontSize:11, color:'#9ca3af', marginTop:6, textAlign:'right' }}>🟠 = Selected range ({rangeLabel})</div>
        </CC>
        <InsightSection role="finance" />
      </>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div className={`sidebar-overlay${sidebarOpen?' active':''}`} onClick={()=>setSidebarOpen(false)} aria-hidden="true"/>
      <div className="dashboard-wrapper role-layout">
        <aside className={`sidebar${sidebarOpen?' open':''}`} id="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark"><Ico.Grad /></div>
            <div className="logo-text-wrap">
              <div className="logo-title">MIT Connect</div>
              <div className="logo-sub">{data.label} Portal</div>
            </div>
          </div>
          <nav className="sidebar-nav">
            {menuGroups.map((group)=>(
              <div key={group.title}>
                <div className="nav-section-label">{group.title}</div>
                <ul>{group.items.map((item)=>{
                  const isActive = item === 'Analytics';
                  return <li key={item}><a href="#" className={isActive?'active':''} onClick={e=>e.preventDefault()}>{item}</a></li>;
                })}</ul>
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <a href="#" onClick={e=>{ e.preventDefault(); handleLogout(); }}><Ico.Logout /> Logout</a>
          </div>
        </aside>

        <main className="main-content">
          <div className="topbar">
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <button className="mobile-menu-btn" onClick={()=>setSidebarOpen(true)} aria-label="Toggle menu"><Ico.Menu /></button>
              <button type="button" onClick={()=>navigate(-1)} style={{ display:'flex', alignItems:'center', gap:6, background:'#fff', border:'1px solid #e5e7eb', borderRadius:8, padding:'0 12px', height:36, fontSize:13, fontWeight:500, color:'#6b7280', cursor:'pointer' }}>
                <Ico.Back /> Back
              </button>
              <div className="topbar-left">
                <h2>Analytics Dashboard</h2>
                <p>
                  {role==='student'&&'Your personal performance overview'}
                  {role==='faculty'&&'Class performance & engagement metrics'}
                  {role==='admin'  &&'College-wide statistics and insights'}
                  {role==='finance'&&'Fee collection and financial insights'}
                </p>
              </div>
            </div>
            <div className="topbar-right" style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:11, color:'#9ca3af', fontWeight:500 }}>
                Updated {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
              </span>
            </div>
          </div>

          <FilterBar />

          {role==='student' && <StudentView />}
          {role==='faculty' && <FacultyView />}
          {role==='admin'   && <AdminView   />}
          {role==='finance' && <FinanceView  />}
        </main>
      </div>
    </>
  );
}