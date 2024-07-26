const axios = require('axios');
console.log("mic test")


const csvFilePath='./scripts/questionData.csv'

const csv=require('csvtojson')
let counter = 0;



const  pleasework = async () => {
const jsonArray= await csv().fromFile(csvFilePath);

console.log(jsonArray);
   for(let i =0; i < jsonArray.length; i++){
            if (i%6===0) {
                counter +=1;
            }

            let obj = jsonArray[i];
            // console.log(` ${counter}`)
            console.log(`${i} ${counter} `)
            // console.log(obj.keyword)
            // console.log(JSON.parse(obj.keyword))
            obj.keyword = JSON.parse(obj.keyword)
            // console.log(obj)
            // console.log(counter)

            let question = await axios.post('http://localhost:3000/question', obj)
            // console.log(question.data.questionId)
           // console.log(counter)
           
            

            axios.post(`http://localhost:3000/question/${question.data.questionId}/industry`, {industryId: counter})
          
           
           
    }
}

pleasework();