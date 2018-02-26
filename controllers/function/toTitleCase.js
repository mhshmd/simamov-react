module.exports = (str) => {
	return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}).replace(/Stis/g, 'STIS').replace(/Pnbp/g, 'PNBP').replace(/Div/g, 'DIV');
}