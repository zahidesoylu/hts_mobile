// src/services/analyseReport.ts veya ilgili dosyanız

import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult } from "../utils/analysisResult"; // Yukarıdaki AnalysisResult'ı burada import edin

export async function analyseReport(content: string): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyCDZmgSWuIKRewtddCHppgT3z0-C1lXrSM",
  });

  const config = {
    responseMimeType: "text/plain",
    systemInstruction: [
      {
        text: `Sen bir sağlık izleme asistanısın. Kullanıcı kronik hastalığıyla ilgili günlük rapor dolduruyor. Verilen cevapları analiz et ve aşağıdaki 3 sınıftan birine göre durumu değerlendir çok extreme bir durum olmadıkça takip gerektirene koyma. Eğer koyduysan doktora hastanın acil durum kişilerine ulaşması gerektiğini hatırlat.:
  1. "İyi"
  2. "Normal"
  3. "Takip Gerektiren"
  
  Cevap json formatı:
  - category: (İyi / Normal / Takip Gerektiren)
  - description:(neden bu kategori seçildiğini belirt)
  - note: Bu bilgi doktora iletilecektir.
  `,
      },
    ],
  };

  const model = "gemini-2.0-flash-lite";
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: content,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  let data = "";
  for await (const chunk of response) {
    data += chunk.text;
  }

  data = data.replace("```json", "").replace("```", "").trim();

  // JSON.parse işlemi sonrasında türü belirtelim
  let parsedData: AnalysisResult;

  try {
    parsedData = JSON.parse(data) as AnalysisResult; // Tür belirtme
  } catch (error) {
    console.error("Veri parse hatası:", error);
    throw new Error("JSON formatı hatalı.");
  }

  console.log("Response:", parsedData);
  console.log("Category:", parsedData.category);
  console.log("Description:", parsedData.description);
  console.log("Note:", parsedData.note);

  return parsedData;
}
