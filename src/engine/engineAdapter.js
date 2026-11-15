import { calculateMission, getResourceStatus } from "./missionEngine.js";
import { calculateMissionScore } from "./scoring.js";
import { analyzeWhatIf } from "./whatIf.js";
export const COMPONENT_ID_MAP = {
 "structure-1":"structure_6u","power-1":"solar_body_6u","power-2":"solar_deployable_6u",
 "battery-1":"battery_standard","battery-2":"battery_high_capacity","camera-1":"camera_basic",
 "camera-2":"camera_advanced","computer-1":"computer_standard","communication-1":"comms_basic",
 "communication-2":"comms_high_rate","adcs-1":"adcs_basic","adcs-2":"adcs_precise","eps-1":"eps_standard"
};
export function convertBuilderSelection(items=[]){return items.map(item=>{const id=COMPONENT_ID_MAP[item.id];if(!id)throw new Error(`No engine mapping for ${item.name}`);return id;});}
export function runEngineeringAnalysis(items=[]){const mission=calculateMission(convertBuilderSelection(items));const score=calculateMissionScore(mission);return {mission,score,resourceStatus:getResourceStatus(mission),feasible:mission.feasible,status:mission.status,violations:mission.violations,warnings:mission.warnings};}
export function runEngineeringWhatIf(before=[],after=[]){return analyzeWhatIf(convertBuilderSelection(before),convertBuilderSelection(after));}
