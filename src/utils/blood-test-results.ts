function getHemoglobinStatus(hemoglobinStr: string) {
	const hemoglobin = parseFloat(hemoglobinStr);
	if (isNaN(hemoglobin)) return null;

	if (hemoglobin < 120) return 'Anemia';
	return null;
}

function getLeukocytesStatus(leukocytesStr: string) {
	const leukocytes = parseFloat(leukocytesStr);
	if (isNaN(leukocytes)) return null;

	if (leukocytes < 3.2) return 'Carcinogenic growth in the system, possible cancer';
	if (leukocytes > 8.2) return 'Leukocytosis (non-harmful infection)';
	return null;
}

function getNatriumStatus(natriumStr: string) {
	const natrium = parseFloat(natriumStr);
	if (isNaN(natrium)) return null;

	if (natrium < 137) return 'Hyponatremia (overhydrated), may cause seizures, vomiting, diaria';
	if (natrium > 145) return 'Dehydration';
	return null;
}

function getKaliumStatus(kaliumStr: string) {
	const kalium = parseFloat(kaliumStr);
	if (isNaN(kalium)) return null;

	if (kalium < 3.5) return 'Hypokalemia (too little kalium in the system), feeling tired, leg cramps, weakness, and constipation. Risk of an abnormal heart rhythm. Can cause cardiac arrest.';
	if (kalium > 5.1) return 'Dehydrated';
	return null;
}

function getHCGStatus(hcgStr: string) {
	const hcg = parseFloat(hcgStr);
	if (isNaN(hcg)) return null;

	if (typeof hcg !== 'number') return null;
	if (hcg > 5) return 'Pregnant';
	return null;
}

function getACNEnzymeStatus(acnEnzymeStr: string) {
	const acnEnzyme = parseFloat(acnEnzymeStr);
	if (isNaN(acnEnzyme)) return null;

	if (acnEnzyme > 35.8) return 'Genetic Muscular dystrophy (various types)';
	if (acnEnzyme > 20.3) return 'Muscular dystrophy (various types)';
	return null;
}

export function getBloodTestResultText(resultsModel: any) {
	const bloodType = resultsModel.get('blood_type');
	const hemoglobin = resultsModel.get('hemoglobin');
	const leukocytes = resultsModel.get('leukocytes');
	const kalium = resultsModel.get('kalium');
	const natrium = resultsModel.get('natrium');
	const hcg = resultsModel.get('hcg');
	const acnEnzyme = resultsModel.get('acn_enzyme');
	const subAbuse = resultsModel.get('sub_abuse');

	const hemoglobinStatus = getHemoglobinStatus(hemoglobin);
	const leukocytesStatus = getLeukocytesStatus(leukocytes);
	const natriumStatus = getNatriumStatus(natrium);
	const kaliumStatus = getKaliumStatus(kalium);
	const hcgStatus = getHCGStatus(hcg);
	const acnEnzymeStatus = getACNEnzymeStatus(acnEnzyme);

	return `**Blood test results:**

	Blood type: ${bloodType}

	Hemoglobin: ${hemoglobin} g/l ${hemoglobinStatus ? `*(${hemoglobinStatus})*` : ''}

	Leukocytes: ${leukocytes} E9/l ${leukocytesStatus ? `*(${leukocytesStatus})*` : ''}

	Kalium: ${kalium} mmol/l ${kaliumStatus ? `*(${kaliumStatus})*` : ''}

	Natrium: ${natrium} mmol/l ${natriumStatus ? `*(${natriumStatus})*` : ''}

	hCG: ${hcg} IU/l ${hcgStatus ? `*(${hcgStatus})*` : ''}

	ACN enzyme: ${acnEnzyme} mmol/l ${acnEnzymeStatus ? `*(${acnEnzymeStatus})*` : ''}

	Substance abuse: ${subAbuse}

	Details: ${resultsModel.get('details') || 'None'}`;
}
