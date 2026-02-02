

export default function Chat(){

    return(
        <div className="w-full h-full flex flex-col">
            <div className="w-full h-20 flex items-center pl-5">
                <h2 className="font-bold text-2xl text-white">Chat title</h2>
            </div>

            {/* Messages */}
            <div className="w-full h-4/5 bg-zinc-600">

            </div>


            <div className="w-full h-20 flex items-center justify-center">
                <div className="w-4/5 h-full flex items-center justify-center gap-5">
                    <div className="w-15 h-15 bg-zinc-600 rounded-4xl flex justify-center items-center cursor-pointer hover:bg-zinc-700 duration-200">
                        <img className="w-7" src="./doc.png" alt="document" />
                    </div>
                    <input className="w-4/5 h-15 rounded-2xl bg-zinc-600 pl-3 text-white text-lg outline-0" type="text" />
                    <div className="w-15 h-15 bg-zinc-600 rounded-4xl flex justify-center items-center cursor-pointer hover:bg-zinc-700 duration-200">
                        <img className="w-6" src="./send.png" alt="send" />
                    </div>
                </div>
            </div>
        </div>
    );

}