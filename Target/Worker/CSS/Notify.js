var s=async(o,r)=>{if(o)try{const e=await self.clients.get(o);e&&e.postMessage({_LOAD_CSS_WORKER:r})}catch{}};export{s as default};
