import axios from "axios"
import { APIKEY } from "../../misc/APIKEY";

export function readBook(fen: string): string {
    axios.get(
        `https://chess-api.roastlemon.com/engine/${fen}`,
        {
            headers: {'Authorization': `Bearer ${APIKEY}`},
        }
    ).
        then(res => {
            console.log(res.data)
            const production_response = res.data
            console.log(typeof(res.data))
            return production_response["selected_move"]
        }).catch(err => {
            console.log(err)
            //production_response = err
        });

    /*axios.get(
        `http://127.0.0.1:8000/engine/${fen}`,
        {
            headers: {'Authorization': `Bearer ${APIKEY}`}
        }
    ).
        then(res => {
            console.log(res.data)
            const development_response = res.data
            return development_response["selected_move"]
        }).catch(err => {
            console.log(err)
            //development_response = err
        });
    */
    return "";
}