const moment = require('moment');
const sequelize = require('sequelize');
const Op = sequelize.Op;
const promise = require('promise');

const modelTingkatPendidikan = require('../models').db_tingkat_pendidikan;
const libUtil = require('../libraries/utility.js');

exports.saveTingkatPendidikan = function( pTingkatPendidikanId, pTingkatPendidikanNama ){
    modelTingkatPendidikan
        .findOne( {
            where:{
                id: parseInt(pTingkatPendidikanId)
            }
        } )
        .then( item => {
            if( !item ){
                modelTingkatPendidikan
                    .create( {
                        id: pTingkatPendidikanId,
                        name: pTingkatPendidikanNama
                    } )
                    .then( () => {
                        return pTingkatPendidikanId;
                    } )
            }else{
                modelTingkatPendidikan
                .update( {
                    name: pTingkatPendidikanNama
                },{
                    where:{
                        id: pTingkatPendidikanId
                    }
                } )
                .then( () => {
                    return pTingkatPendidikanId;
                } ) 
            }
        })

}