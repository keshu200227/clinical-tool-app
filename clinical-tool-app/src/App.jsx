import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const LOCAL_STORAGE_KEY = "clinical_prescriptions";

const defaultPrescriptions = {
  "common cold": {
    firstLine: "Symptomatic treatment; no antibiotics.",
    management: [
      "Paracetamol 500 mg TID (e.g., Calpol, Crocin)",
      "Pseudoephedrine or phenylephrine (e.g., Sinarest, Otrivin Cold)",
      "Chlorpheniramine maleate (e.g., Cetrizine Plus, CPM)",
      "Rest, hydration, steam inhalation"
    ],
    symptoms: [
      "Runny or blocked nose",
      "Sneezing",
      "Sore throat",
      "Mild fever",
      "Cough"
    ],
    labs: [
      "Not routinely required unless secondary infection suspected"
    ]
  },
  "gastritis": {
    firstLine: "Omeprazole 20 mg once daily before meals (e.g., Omez, Ocid).",
    management: [
      "Antacids for immediate relief (e.g., Gelusil, Digene)",
      "Triple therapy (PPI, amoxicillin, clarithromycin) if H. pylori present"
    ],
    symptoms: [
      "Epigastric pain",
      "Nausea",
      "Bloating",
      "Belching",
      "Early satiety"
    ],
    labs: [
      "H. pylori antigen test (stool or breath test)",
      "CBC to rule out anemia"
    ]
  },
  "diarrhea": {
    firstLine: "ORS with low-osmolarity + Zinc (e.g., Zinconia, Z&D)",
    management: [
      "Probiotics: Lactobacillus GG or Saccharomyces boulardii (e.g., Vizylac, Econorm)",
      "Antibiotics only if bacterial cause suspected (e.g., Norflox, Metrogyl)"
    ],
    symptoms: [
      "Loose, watery stools",
      "Abdominal cramps",
      "Urgency",
      "Fatigue",
      "Possible fever"
    ],
    labs: [
      "Stool routine and culture",
      "Electrolytes (Na, K, Cl)",
      "CRP if febrile"
    ]
  },
  "asthma": {
    firstLine: "Beclomethasone 100–200 mcg BID (e.g., Beclate Inhaler)",
    management: [
      "Add formoterol/budesonide if moderate-severe (e.g., Foracort, Symbicort)",
      "Avoid triggers, educate patient"
    ],
    symptoms: [
      "Wheezing",
      "Cough (often nocturnal)",
      "Shortness of breath",
      "Chest tightness"
    ],
    labs: [
      "PEFR monitoring",
      "Spirometry (FEV1/FVC)",
      "Allergy testing if indicated"
    ]
  },
  "copd": {
    firstLine: "Tiotropium (e.g., Tiova) or Salmeterol (e.g., Seroflo)",
    management: [
      "ICS for frequent exacerbations (e.g., Budecort, Pulmicort)",
      "Pulmonary rehab, stop smoking"
    ],
    symptoms: [
      "Chronic productive cough",
      "Dyspnea on exertion",
      "Fatigue",
      "Wheezing"
    ],
    labs: [
      "Spirometry (post-bronchodilator FEV1/FVC < 0.7)",
      "Chest X-ray",
      "ABG if severe"
    ]
  },
  "hypertension": {
    firstLine: "Lifestyle changes + Amlodipine 5 mg once daily (e.g., Amlong, Stamlo).",
    management: [
      "Reduce salt intake, regular exercise",
      "Monitor BP regularly",
      "Consider ARBs or ACE inhibitors (e.g., Telmisartan, Enalapril)"
    ],
    symptoms: [
      "Often asymptomatic",
      "Headache",
      "Dizziness",
      "Visual disturbances"
    ],
    labs: [
      "Blood pressure monitoring",
      "Lipid profile",
      "Serum creatinine and electrolytes"
    ]
  },
  "diabetes": {
    firstLine: "Metformin 500 mg BID (e.g., Glycomet, Gluformin).",
    management: [
      "Diet and lifestyle modifications",
      "Monitor blood glucose",
      "Add sulfonylureas or insulin if uncontrolled"
    ],
    symptoms: [
      "Increased thirst",
      "Frequent urination",
      "Fatigue",
      "Blurred vision"
    ],
    labs: [
      "Fasting and postprandial blood sugar",
      "HbA1c",
      "Urine routine"
    ]
  },
  "uti": {
    firstLine: "Nitrofurantoin 100 mg BID for 5 days (e.g., Niftas, Martifur).",
    management: [
      "Hydration",
      "Urine alkalizers",
      "Ciprofloxacin if resistance suspected"
    ],
    symptoms: [
      "Burning urination",
      "Frequency",
      "Urgency",
      "Lower abdominal pain"
    ],
    labs: [
      "Urine routine and microscopy",
      "Urine culture"
    ]
  },
  "heart attack (mi)": {
    firstLine: "Aspirin 325 mg stat + Clopidogrel + Atorvastatin (e.g., Ecosprin-AV).",
    management: [
      "Oxygen, Morphine, Nitrates",
      "Beta-blockers, ACE inhibitors",
      "Immediate PCI or thrombolysis"
    ],
    symptoms: [
      "Severe chest pain",
      "Sweating",
      "Nausea",
      "Breathlessness"
    ],
    labs: [
      "ECG",
      "Cardiac enzymes (Trop-I, CK-MB)",
      "Echocardiogram"
    ]
  },
  "anemia": {
    firstLine: "Ferrous sulfate 325 mg once to thrice daily (e.g., Orofer, Fefol).",
    management: [
      "Iron-rich diet (green leafy vegetables, red meat, fortified cereals)",
      "Vitamin C to enhance absorption",
      "Treat underlying cause (e.g., worm infestation, menorrhagia)"
    ],
    symptoms: [
      "Fatigue",
      "Pallor",
      "Dizziness",
      "Breathlessness on exertion",
      "Pica (craving non-food substances)"
    ],
    labs: [
      "Hemoglobin",
      "Serum ferritin",
      "Peripheral smear",
      "TIBC (Total Iron Binding Capacity)"
    ]
  },
  "migraine": {
    firstLine: "Paracetamol or NSAIDs (e.g., Naproxen, Ibuprofen) + antiemetic (e.g., Domperidone).",
    management: [
      "Triptans (e.g., Sumatriptan) for acute attacks",
      "Prophylaxis: Propranolol or Amitriptyline if frequent attacks",
      "Avoid known triggers (e.g., cheese, chocolate, stress)"
    ],
    symptoms: [
      "Unilateral pulsating headache",
      "Nausea or vomiting",
      "Photophobia / phonophobia",
      "Aura (visual, sensory, or motor)"
    ],
    labs: [
      "Clinical diagnosis",
      "MRI brain if red flag symptoms (e.g., sudden onset, focal neuro deficit)"
    ]
  },
  "tuberculosis": {
    firstLine: "Category I DOTS: 2 months HRZE, followed by 4 months HR (e.g., AKT-4 kit).",
    management: [
      "Adherence to RNTCP or WHO DOTS protocol",
      "Nutritional support",
      "Contact tracing and screening"
    ],
    symptoms: [
      "Chronic cough (>2 weeks)",
      "Hemoptysis",
      "Fever (especially evening rise)",
      "Weight loss, night sweats"
    ],
    labs: [
      "Sputum AFB",
      "CB-NAAT (GeneXpert)",
      "Chest X-ray",
      "ESR, Mantoux test"
    ]
  },
  "hypothyroidism": {
    firstLine: "Levothyroxine 25–100 mcg daily based on TSH (e.g., Eltroxin, Thyronorm).",
    management: [
      "Regular TSH monitoring every 6–12 weeks initially",
      "Adjust dose as per clinical response",
      "Address associated dyslipidemia or weight gain"
    ],
    symptoms: [
      "Fatigue",
      "Weight gain",
      "Cold intolerance",
      "Constipation",
      "Depression, slow cognition"
    ],
    labs: [
      "TSH",
      "Free T4",
      "Anti-TPO antibodies (if autoimmune suspected)"
    ]
  },
  "depression": {
    firstLine: "SSRI such as Escitalopram 10 mg daily (e.g., Nexito, Cipralex).",
    management: [
      "Cognitive Behavioral Therapy (CBT)",
      "Lifestyle changes: exercise, sleep hygiene",
      "Psych referral if no improvement in 6 weeks"
    ],
    symptoms: [
      "Persistent sadness or irritability",
      "Anhedonia (loss of interest)",
      "Fatigue",
      "Suicidal thoughts"
    ],
    labs: [
      "PHQ-9 questionnaire",
      "Thyroid panel (rule out hypothyroidism)",
      "Vitamin B12, D levels (if fatigue prominent)"
    ]
  }
};

export default function ClinicalTool() {
  const [prescriptions, setPrescriptions] = useState({});
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newDisease, setNewDisease] = useState("");
  const [newFirstLine, setNewFirstLine] = useState("");
  const [newManagement, setNewManagement] = useState("");
  const [newSymptoms, setNewSymptoms] = useState("");
  const [newLabs, setNewLabs] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");
  const [ageGroup, setAgeGroup] = useState("adult");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [adultDose, setAdultDose] = useState("");
  const [calculatedDose, setCalculatedDose] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setPrescriptions(JSON.parse(stored));
    } else {
      setPrescriptions(defaultPrescriptions);
    }
  }, []);

  useEffect(() => {
    const key = query.trim().toLowerCase();
    const matched = Object.entries(prescriptions).filter(([disease]) =>
      disease.toLowerCase().startsWith(key)
    );
    setResults(matched);
  }, [query, prescriptions]);

  const handleAddOrEdit = () => {
    const key = newDisease.trim().toLowerCase();
    if (!newDisease || !newFirstLine) {
      setError("Disease name and first-line treatment are required.");
      return;
    }
    if (prescriptions[key]) {
      setError("This disease already exists. Please edit instead.");
      return;
    }
    const updatedPrescriptions = {
      ...prescriptions,
      [key]: {
        firstLine: newFirstLine,
        management: newManagement.split("\n").map(item => item.trim()).filter(Boolean),
        symptoms: newSymptoms.split("\n").map(item => item.trim()).filter(Boolean),
        labs: newLabs.split("\n").map(item => item.trim()).filter(Boolean)
      }
    };
    setPrescriptions(updatedPrescriptions);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPrescriptions));
    setNewDisease("");
    setNewFirstLine("");
    setNewManagement("");
    setNewSymptoms("");
    setNewLabs("");
    setError("");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Empirical Prescription Tool", 10, 10);
    Object.entries(prescriptions).forEach(([disease, data], i) => {
      doc.autoTable({
        head: [["Disease", "First-line", "Management", "Symptoms", "Labs"]],
        body: [[
          disease,
          data.firstLine,
          data.management.join("; "),
          data.symptoms.join("; "),
          data.labs.join("; ")
        ]],
        startY: 20 + i * 30
      });
    });
    doc.save("prescriptions.pdf");
  };

  const generateDrugLink = (text) => {
    const match = text.match(/\(e\.g\., ([^)]+)\)/);
    if (match) {
      const brands = match[1].split(", ");
      return brands.map((brand, i) => (
        <a
          key={i}
          href={`https://www.drugs.com/search.php?searchterm=${encodeURIComponent(brand)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline ml-1"
        >{brand}</a>
      ));
    }
    return null;
  };

  const calculateDose = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const dose = parseFloat(adultDose);

    let finalDose = null;
    if (!dose || !w || w <= 0) return;

    switch (ageGroup) {
      case "pediatric":
        finalDose = (w / 70) * dose;
        break;
      case "bsa":
        if (!h || h <= 0) return;
        const bsa = Math.sqrt((w * h) / 3600);
        finalDose = (bsa / 1.73) * dose;
        break;
      default:
        finalDose = dose;
    }
    setCalculatedDose(finalDose.toFixed(2));
  };

  return (
    <div className={"max-w-xl mx-auto p-4 space-y-4 " + (darkMode ? "bg-gray-900 text-white" : "bg-white text-black")}> 
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Empirical Prescription Tool</h1>
        <Button variant="outline" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Input placeholder="Enter disease name" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAdmin(!isAdmin)}>
            {isAdmin ? "Exit Admin" : "Admin Panel"}
          </Button>
          <Button onClick={exportToPDF}>Export PDF</Button>
        </div>
      </div>

      {results.length > 0 ? (
        results.map(([disease, result]) => (
          <Card key={disease}>
            <CardContent className="space-y-2 p-4">
              <p><strong>Disease:</strong> {disease}</p>
              <p><strong>First-line Treatment:</strong> {result.firstLine} {generateDrugLink(result.firstLine)}</p>
              <p><strong>Management:</strong></p>
              <ul className="list-disc pl-5">
                {result.management.map((item, idx) => (
                  <li key={idx}>{item} {generateDrugLink(item)}</li>
                ))}
              </ul>
              <p><strong>Symptoms:</strong></p>
              <ul className="list-disc pl-5">
                {result.symptoms.map((symptom, idx) => (
                  <li key={idx}>{symptom}</li>
                ))}
              </ul>
              <p><strong>Lab Parameters:</strong></p>
              <ul className="list-disc pl-5">
                {result.labs.map((lab, idx) => (
                  <li key={idx}>{lab}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      ) : (
        query && <p className="text-center text-red-500">No match found for "{query}".</p>
      )}

      <div className="space-y-2 border-t pt-4">
        <h2 className="text-xl font-semibold">Drug Dose Calculator</h2>
        <select className="w-full p-2 rounded border" value={ageGroup} onChange={e => setAgeGroup(e.target.value)}>
          <option value="adult">Adult</option>
          <option value="pediatric">Pediatric (Clark's Rule)</option>
          <option value="bsa">Pediatric (BSA Method)</option>
        </select>
        <Input placeholder="Weight (kg)" value={weight} onChange={e => setWeight(e.target.value)} />
        {ageGroup === "bsa" && (
          <Input placeholder="Height (cm)" value={height} onChange={e => setHeight(e.target.value)} />
        )}
        <Input placeholder="Adult Dose (mg)" value={adultDose} onChange={e => setAdultDose(e.target.value)} />
        <Button onClick={calculateDose}>Calculate Dose</Button>
        {calculatedDose && <p className="font-bold">Calculated Dose: {calculatedDose} mg</p>}
      </div>

      {isAdmin && (
        <div className="p-4 border rounded-xl space-y-2">
          <h2 className="text-xl font-semibold">Admin Panel</h2>
          {error && <p className="text-red-500">{error}</p>}
          <Input placeholder="Disease Name" value={newDisease} onChange={(e) => setNewDisease(e.target.value)} />
          <Input placeholder="First-line Treatment" value={newFirstLine} onChange={(e) => setNewFirstLine(e.target.value)} />
          <Textarea placeholder="Management steps (one per line)" value={newManagement} onChange={(e) => setNewManagement(e.target.value)} />
          <Textarea placeholder="Symptoms (one per line)" value={newSymptoms} onChange={(e) => setNewSymptoms(e.target.value)} />
          <Textarea placeholder="Lab Parameters (one per line)" value={newLabs} onChange={(e) => setNewLabs(e.target.value)} />
          <Button onClick={handleAddOrEdit}>Add / Update</Button>
        </div>
      )}
    </div>
  );
}
