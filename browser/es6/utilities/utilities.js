export const formToJson = function(jqForm) {
    console.log("in formToJson", jqForm, jqForm.serializeArray());
	return jqForm.serializeArray().reduce(function(data, x) {
        console.log(x);
		data[x.name] = x.value;
		return data;
	}, {});
}
export default {};
