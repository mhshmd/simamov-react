export default (obj)=>{
    if(!obj || obj == '-' || obj == '') return 0;
    if (typeof obj === 'string' || obj instanceof String) return +obj.replace(/\D/g, '');
    return +obj;
}