import React, { useState, useEffect } from 'react';
import { getAIConfig, updateAIModel } from '../api/admin';

export default function AdminAIConfig() {
  const [currentModel, setCurrentModel] = useState('llama3.2:1b');
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const models = ['llama3.2:1b', 'mistral', 'gemma:2b'];

  useEffect(() => {
    getAIConfig()
      .then(res => setCurrentModel(res.MODEL_NAME))
      .catch(err => console.error(err));
  }, []);

  const changeModel = async (newModel) => {
    setLoading(true);
    setErrorModal(false);

    try {
      await updateAIModel(newModel);
      setCurrentModel(newModel);
    } catch (err) {

      setErrorMessage(err.response?.data?.detail || 'Greška');
      setErrorModal(true);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-zinc-700 rounded-lg">

      <div className="flex items-center gap-4 mb-6 p-4 bg-zinc-600 rounded-lg shadow-md border border-zinc-500">
        <img
          src="./ai.png"
          alt="AI Config"
          className="w-8 h-8 rounded-lg shadow-lg"
        />
        <h3 className="text-2xl font-bold text-white flex-1">
          AI Model Switcher
        </h3>
      </div>
      <div className="space-y-4">
        <label className="block text-white text-lg font-semibold">Current model:</label>
        <div className="relative w-full max-w-xs">
          <select
            value={currentModel}
            onChange={e => changeModel(e.target.value)}
            disabled={loading}
            className="w-full bg-white p-3 pr-10 rounded-xl text-xl outline-none appearance-none disabled:opacity-50 cursor-pointer"
          >
            {models.map(model => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-600">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="w-1/5 text-sm text-zinc-600 bg-white p-3 rounded" style={{ display: currentModel === undefined ? 'none' : 'block' }}>
          {loading ? ' Loading...' : `${currentModel} - activated!`}
        </div>

      </div>

      {/*Error Modal*/}
      {errorModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setErrorModal(false)}>
          </div>
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-zinc-800 p-8 rounded-2xl border-4 max-w-md mx-4 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12  flex items-center justify-center flex-shrink-0">
                  <img
                    src="./crisis.png"
                    alt="Warning"
                    className="w-7 h-7"
                  />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">Warning!</h4>
                  <p className="text-zinc-300 text-lg">Failed to change model. Try again.</p>
                </div>
              </div>
              <button
                onClick={() => setErrorModal(false)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
