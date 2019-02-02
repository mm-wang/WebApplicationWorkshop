import consoleTest from "./components/utilities.js";
const hello = {
    hello: function(){
        console.log("hello world!");
        consoleTest();
    }
}
hello.hello();

export default hello;
