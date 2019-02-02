import * as test from "components/utilities.js";
const hello = {
    hello: function(){
        console.log("hello world!");
        test.test();
    }
}
hello.hello();

export default hello;
