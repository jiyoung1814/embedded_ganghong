const express = require('express');
const router = express.Router();
const db = require('../../db/index');

router.post('/status', async(req, res)=>{

    data = {
        'status': false
    }
    
    target = parseInt(req.body.target);
    score = parseInt(req.body.score);

    //타겟 상태 확인
    try{
        target_results = await db.promise().query('select status from embedded.target where id = '+target+';');
        check_status = true
    }catch(err){
        console.log(err)
    }

    if(check_status){
        try{
            await db.promise().query('UPDATE embedded.score SET score = ' + score+ 'WHERE target = '+ target+ 'ORDER BY num DESC LIMIT 1; ')
        }catch(err){
            console.log(err)
        }
        
    }
})


module.exports = router;