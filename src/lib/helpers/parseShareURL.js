export const parseShareURL = (s) => {
    let explode1 = s.split("view:share");

    let obj = {}

    if( explode1.length > 1 ) {
        let explode2 = explode1[1].split("$");
            if( explode2.length > 1) {
               explode2.forEach(e => {
                let explode3 = e.split(":");
                if( explode3.length > 1 ) {
                    obj[explode3[0]] = explode3.slice(1).join(':')
                }
               });
               
               if(obj.center) {
                obj.center = obj.center.split(',').map(d=>+d);
               }
               return obj;
            } else { return; }
    }

    else { return }
}