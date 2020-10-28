import React, { useEffect, useState } from 'react';
import StockList from '../components/StockList';
import StockDetail from '../components/StockDetail';

const url = 'ws://stocks.mnet.website';

let client = null;
let reconnect = true;


const Dashboard = () => {

    const [data, setData] = useState({
        stocks : {}
    });

    const connect = () => {
        client = new WebSocket(url);
        client.onmessage = (message) => {
            message && message.data && addNewStockValue(JSON.parse(message.data))
        };    
        client.onclose = () => {
            setTimeout(() => {
                reconnect && connect();
            }, 1000);
        }
        client.onerror = () => {
            client && client.close();
        }
    }

    useEffect(() => {
        reconnect = true;
        connect();
        return () => {
            reconnect = false;
            client && client.close();
        }
    }, []);

    const onItemSelection = (stockName) => {
        Object.keys(data.stocks).forEach(stockName => {
            const isSelected = data.stocks[stockName].isSelected || false;
            if(isSelected){
                data.stocks[stockName].isSelected = false;
            }
        })
        const existingStockItem = data.stocks[stockName];
        existingStockItem.isSelected = true;
        setData({
            stocks : data.stocks
        });
    }

    const addNewStockValue = (stock) => {

        const timestamp = Date.now();
        const existingStocks = data.stocks;

        stock.forEach(([name, price]) => {
            const _price = Number(price);
            if(existingStocks[name]){
                const existingStockItem = existingStocks[name];
                existingStockItem.price = _price;
                existingStockItem.isSelected = existingStockItem.isSelected || false;
                if(existingStockItem.history.length > 80){
                    existingStockItem.history = existingStockItem.history.slice(50);
                }
                existingStockItem.history.push({ createdAt : timestamp, price : _price});
            }else{
                if(Object.keys(data.stocks).length === 0){
                    existingStocks[name] = { price : _price, history : [{ createdAt : timestamp, price : _price}], isSelected : true};
                }else{
                    existingStocks[name] = { price : _price, history : [{ createdAt : timestamp, price : _price}], isSelected : false};
                }
                
            }
        });
        setData({
            stocks : existingStocks
        });
    }

    return (
        <div className="dashboard">
            {
                Object.keys(data.stocks).length > 0 ? 
                <>
                    <main className="data-list">
                    {data && data.stocks && 
                        <StockList 
                            data={data.stocks} 
                            onItemSelection={onItemSelection}
                        />
                    }
                    </main>
                    <aside className="data-detail">
                        <StockDetail 
                            data={data.stocks} 
                        />
                    </aside>
                </> 
                : 
                <center style={{'flex' : 1}}>
                    <p>Please wait while we are fetching the data from server...</p>
                </center>
            }
            
        </div>
    );
}

export default Dashboard;
