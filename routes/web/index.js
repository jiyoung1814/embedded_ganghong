const express = require('express');
const router = express.Router();
const db = require('../../db/index');


router.post('/start', async(req, res)=>{
    //res 형식
    data = {
        'login': false, 
        'error': ''
    }

    tartet_status = false;
    id_status = false;

    id = req.body.id;
    target = parseInt(req.body.target);


    id_results = '';

    try{
        target_results = await db.promise().query('select status from embedded.target where id = '+target+';');
        // console.log(id_results[0][0]['status'])
        if(target_results[0][0]['status']){//이미 게임이 진행 중인 타겟인 경우
            data['login'] = false;
            data['error'] = '이미 게임이 진행된 타겟입니다.';
        }
        else{ //게임이 진행되지 않은 타겟이 경우

            //id 확인
            try{
                id_results = await db.promise().query('select * from embedded.user where id = \'' + id + '\'; ');

                if(id_results[0][0] == undefined){//신규 아이디이면  user 테이블에 해당 아이디를 추가함 + 동시 접속 못하도록 접속한 아이디의 status = true로 update
                    db.query('INSERT INTO embedded.user (user.id, user.status) VALUES (\'' + id + '\', ' + 0 + ');'); //id테이블에 접속한 id와  status = False로 insert
                }
                
                if(id_results[0][0]['status']){// 아이디의 status가 이미 true라면 동시접속 상태이므로 접속 제한
                    data['login'] = false;
                    data['error'] = '이미 접속된 id입니다.';
                }
                else{
                    data['login'] = true;
                    data['error'] = '';
                }

            }catch(err){
                data['login'] = false;
                data['error'] = err;
            }
        }

    }catch(err){
        data['login'] = false;
        data['error'] = err;
    }

    if(data['login']){
        await db.promise().query('UPDATE embedded.target SET target.status = true where id = \'' + target + '\';'); //target 테이블에 target의 status = True로 update
        await db.promise().query('UPDATE embedded.user SET user.status = true where id = \'' + id + '\';'); //id테이블에 id의 status = True로 update
        await db.promise().query('INSERT INTO embedded.score (id, target ,score) VALUES (\'' + id + '\', ' + target + ',' + 0 + ');'); //score 테이블에 접속한 id, 점수(0점) insert
    }
    else{
        console.log(data['error']);
    }

    res.json(data)

})


router.post('/score',async(req,res)=>{

    check_status = false
    id = req.body.id;
    target = parseInt(req.body.target);

    //타겟과 접속 상태 확인
    try{
        target_results = await db.promise().query('select status from embedded.target where id = '+target+';');
        
        if(target_results[0][0]['status']){//게임이 진행 중인 타겟인 경우
            id_results = await db.promise().query('select status from embedded.user where id = \'' + id + '\'; ');
            if(id_results[0][0]['status']){// 아이디의 status가 1로 접속인 상태일 경우
                check_status = true
            }
        }
    }catch(err){
        console.log(err)
        res.json(err)
    }

    if(check_status){ //모두 정상이라면 해당 id의 점수 return
        try{
            score_results  = await db.promise().query('SELECT score FROM embedded.score WHERE id = \''+id+'\' ORDER BY num DESC LIMIT 1; ')
            data = {
                'score' : score_results[0][0]['score']
            }

            res.json(data);

        }catch(err){
            console.log(err)
            res.json(err)
        }
    }
})

router.post('/end',  async(req, res)=>{
    id = req.body.id;
    target = parseInt(req.body.target);

    await db.promise().query('UPDATE embedded.target SET target.status = false where id = \'' + target + '\';'); //target 테이블에 target의 status = false로 update
    await db.promise().query('UPDATE embedded.user SET user.status = false where id = \'' + id + '\';'); //id테이블에 id의 status = false로 update

    try{
        score_results  = await db.promise().query('SELECT score FROM embedded.score WHERE id = \''+id+'\' ORDER BY num DESC LIMIT 1; ')
        rank_results = await db.promise().query('select * from (select num, id, score, row_number() over (order by score DESC)"rank" from embedded.score) ranked where id = \''+id+'\' ORDER BY num DESC LIMIT 1;')
        
        
        
        data = {
            'score' : score_results[0][0]['score'],
            'own_rank': rank_results[0][0]['rank'],
        }

        res.json(data);

    }catch(err){
        console.log(err)
        res.json(err)
    }

})

router.post('/rank', async(req, res)=>{
    target = parseInt(req.body.target);

    rank = await db.promise().query('select num, id, target, score, row_number() over (order by score DESC)"rank" from embedded.score where target = '+target+ ' order by "rank" DESC LIMIT 10;')
    console.log(rank[0])

    ranking = []
    for(i=0; i<rank[0].length; i++){
        data ={
            'id': rank[0][i]['id'],
            'score': rank[0][i]['score']
        }

        ranking.push(data)
    }

    res.json(ranking)
    
})


module.exports = router;