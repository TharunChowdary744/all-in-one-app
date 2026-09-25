import{r as e}from"./rolldown-runtime-W7wSyTde.js";import{E as t,a as n,i as r,t as i}from"./jsx-runtime-CilgdtPk.js";import{a,n as o,r as s}from"./ui-C_eSc-hu.js";import{t as c}from"./download-FMkrFshK.js";import{n as l}from"./files-Cujr7iz8.js";import{t as u}from"./sanitize-DI4cn7Qw.js";var d=e(t(),1),f=i(),p=`# Welcome to OmniKit

Write **Markdown** on the left and see the result instantly.

## Features
- [x] GitHub-flavored tables and task lists
- [ ] Your next great README

| Tool | Platform |
| ---- | -------- |
| Markdown to HTML | Web & Mobile |

> Tip: use the buttons above to copy or download the HTML.

\`\`\`js
console.log('Hello from OmniKit');
\`\`\`
`;function m(){let[e,t]=(0,d.useState)(p),[i,m]=(0,d.useState)(`preview`),h=(0,d.useMemo)(()=>u(n(e)),[e]);return(0,f.jsxs)(`div`,{className:`split`,children:[(0,f.jsx)(o,{title:`Markdown`,actions:(0,f.jsx)(`button`,{type:`button`,className:`btn btn-ghost btn-sm`,onClick:()=>t(``),children:`Clear`}),children:(0,f.jsx)(`textarea`,{className:`code editor`,value:e,onChange:e=>t(e.target.value),spellCheck:!1,"aria-label":`Markdown input`})}),(0,f.jsx)(o,{title:(0,f.jsx)(a,{value:i,onChange:m,options:[{value:`preview`,label:`Preview`},{value:`html`,label:`HTML`}]}),actions:(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(s,{text:h,label:`Copy HTML`}),(0,f.jsxs)(`button`,{type:`button`,className:`btn btn-primary btn-sm`,onClick:()=>l(r(h),`document.html`,`text/html`),children:[(0,f.jsx)(c,{size:14}),` .html`]})]}),children:i===`preview`?(0,f.jsx)(`div`,{className:`prose editor`,dangerouslySetInnerHTML:{__html:h}}):(0,f.jsx)(`textarea`,{className:`code editor`,readOnly:!0,value:h})})]})}export{m as default};