const express = require('express');
const { authVerify } = require('../helper');
const { createStore, getStoreById, getAllStores, updateStore } = require('../controllers/store.controller');
const { getIdParam } = require('../helper');
const app = express.Router();

app.post('/add', authVerify, async (req,res) =>{
    const data = req.body;
    if(!!!data.title)
        return res.status(400).json({add: false, code:1});
    const Store = await createStore(req.user.UserId, data.title, data.description);
    if (!Store)
        return res.json({add: false, code:2});
    return res.json({add: true, store: Store});
})


app.get('/:id', authVerify, async (req, res)=>{
    const id = getIdParam(req);
    const Store = await getStoreById(id);
	if (Store) return res.status(200).json(Store);
	res.status(404).send('404 - Not found');
})

app.put('/:id', authVerify, async (req,res)=>{
    const id = getIdParam(req);
    const data = req.body;
    if (id !== data.id)
        return res.status(400).json({update: false, code: 1});
    const store = await updateStore(id, data.title,  data.description);
    return res.json({update: store});
})

app.delete('/:id', authVerify, async (req, res)=>{
    return res.json({remove: false});
})

app.get('/all', authVerify, async (req, res)=>{
    const Stores = await getAllStores();
    if(Stores) return res.json(Stores);
    return res.status(404).send('404 - Not found');
})

module.exports = app;