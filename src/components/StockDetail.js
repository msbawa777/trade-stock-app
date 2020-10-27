import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';

const capitalizeWords = (text) => {
    return text.toUpperCase();
}

const StockDetail = (props) => {
    
    const [data, setData] = useState(null);

    useEffect(() => {
        const data = {};
        props.data && Object.keys(props.data).forEach((stockName) => {
            const isSelected = props.data[stockName].isSelected;
            if(isSelected){
                data[stockName] = props.data[stockName].history;
            }
        });
        if(!Object.keys(data).length && Object.keys(props.data).length){
            const stockName = Object.keys(props.data)[0];
            data[stockName] = props.data[stockName].history
        }
        setData(data);
    },[props]);

    const getMapData = (name, array) => {
        const data = {
            labels : [],
            datasets : [],
        }
        const datasets = {
            label: capitalizeWords(name), 
            fill: true,
            backgroundColor: 'rgba(0,103,184,.1)',
            borderColor: 'rgba(0,103,184,1)',
            borderWidth: 1,
            data : []
        };
        const prices = [];
        array.forEach(({price, createdAt}) => {
            prices.push(price);
            data.labels.push(formatAMPM(new Date(createdAt)));
            datasets.data.push(Number(price.toFixed(2)))
        });
        const min = Math.min(...prices).toFixed(2);
        const max = Math.max(...prices).toFixed(2)
        datasets.label = capitalizeWords(name) +` (Low: ${min} | High: ${max})`;
        data.datasets.push(datasets);
        return data;
    }
    
    return (
        <div className="stock-detail">
            {data && (Object.keys(data).length > 0) &&Object.keys(data).map(( stockName, index) => {
                const history = data[stockName];
                return (
                    <Line
                        data={getMapData(stockName, history)}
                        width={500}
                        height={300}
                        key = {index}
                    />
                );
                
            })}
        </div>
    );
}



function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    const strTime = hours + ':' + minutes + ":"+seconds + ' ' + ampm;
    return strTime;
}
export default StockDetail;