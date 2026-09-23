import React from 'react';
import { VisitRecord } from '../types';
import {
  X,
  Building2,
  Calendar,
  MapPin,
  Users,
  Phone,
  ShieldAlert,
  ShieldCheck,
  FileText,
  ExternalLink,
  Edit,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { exportToExcel } from '../services/excelService';

interface RecordDetailModalProps {
  record: VisitRecord;
  onClose: () => void;
  onEdit: (record: VisitRecord) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  onClose,
  onEdit,
}) => {
  const h = record.htblElements;

  const htblList = [
    { label: 'Debt / Obligation', data: h?.debtObligation },
    { label: 'Advance', data: h?.advance, isAdvance: true },
    { label: 'Custom / Social Obligation', data: h?.customSocialObligation },
    { label: 'Succession', data: h?.succession },
    { label: 'Economic Consideration', data: h?.economicConsideration },
    { label: 'Caste or Community', data: h?.casteOrCommunity },
    { label: 'Surety / Contract', data: h?.suretyOrContract },
    { label: 'Inter-State', data: h?.interState },
    { label: 'Right to Minimum Wage (Deprivation)', data: h?.rightToMinimumWage },
    { label: 'Freedom of Employment (Restricted)', data: h?.freedomOfEmployment },
    { label: 'Right to Move Freely (Restricted)', data: h?.rightToMoveFreely },
    { label: 'Right to Appropriate / Sell at Market', data: h?.rightToAppropriateSellAtMarket },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-2xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-3.5 sm:px-6 sm:py-4 border-b border-slate-200 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 bg-slate-50 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                {record.id}
              </span>
              <span className="text-xs text-slate-500 font-medium truncate">
                Visit on {record.dateOfVisit} ({record.noOfVisit})
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1 truncate">{record.industryName}</h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <button
              onClick={() => onEdit(record)}
              className="inline-flex items-center gap-1 min-h-[38px] px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => exportToExcel([record], `${record.id}_Export.xlsx`)}
              className="inline-flex items-center gap-1 min-h-[38px] px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 text-xs text-slate-700">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
            record.isHtblPotential
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center gap-3">
              {record.isHtblPotential ? (
                <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              )}
              <div>
                <p className="font-bold text-sm">
                  {record.isHtblPotential
                    ? 'HT&BL Potential Case Flagged'
                    : 'No HT&BL Elements Identified'}
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Case Status: <strong>{record.caseStatus}</strong>
                </p>
              </div>
            </div>

            {record.locationLink && (
              <a
                href={record.locationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50 rounded-lg font-semibold shrink-0 shadow-2xs"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                Open Map
              </a>
            )}
          </div>

          {/* Section A: Visit & Worksite Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Section A: Visit & Jurisdiction Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Reporting Person</span>
                <span className="font-semibold text-slate-800">{record.reportingPerson || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date / Month</span>
                <span className="font-semibold text-slate-800">{record.dateOfVisit} ({record.month})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cluster Name</span>
                <span className="font-semibold text-slate-800">{record.clusterName || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Industry Type</span>
                <span className="font-semibold text-slate-800">{record.industryType}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Worksite Season</span>
                <span className="font-semibold text-slate-800">{record.seasonality}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Mandal</span>
                <span className="font-semibold text-slate-800">{record.mandal}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Area / Village / Ward</span>
                <span className="font-semibold text-slate-800">{record.areaVillageWard || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Revenue Division</span>
                <span className="font-semibold text-slate-800">{record.revenueDivision || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Police Station</span>
                <span className="font-semibold text-slate-800">{record.policeStation || '-'}</span>
              </div>
            </div>
          </div>

          {/* Section B: Worker Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              Section B: Worker Demographics & Migration
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Workers</span>
                <span className="text-base font-extrabold text-slate-900">{record.approxWorkersCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Male / Female</span>
                <span className="font-semibold text-slate-800">M: {record.maleWorkersCount} | F: {record.femaleWorkersCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Interacted Persons</span>
                <span className="font-semibold text-slate-800">{record.interactedPersonsCount}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Families Living on Site</span>
                <span className="font-semibold text-slate-800">{record.familiesCount}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Other State Labour (States)</span>
                <span className="font-medium text-slate-800">{record.otherStateLabour || 'None'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Intra State Labour (Districts)</span>
                <span className="font-medium text-slate-800">{record.intraStateLabour || 'None'}</span>
              </div>
            </div>
          </div>

          {/* Section C: Contact Details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <Phone className="w-4 h-4 text-emerald-600" />
              Section C: Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Contact Person (Mukadam)</span>
                <span className="font-semibold text-slate-800">{record.contactPersonName || '-'}</span>
                <span className="text-xs text-slate-500 block">{record.contactPersonPhone || 'No phone recorded'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Owner / Management</span>
                <span className="font-semibold text-slate-800">{record.ownerName || '-'}</span>
                <span className="text-xs text-slate-500 block">{record.ownerPhone || 'No phone recorded'}</span>
              </div>
            </div>
          </div>

          {/* Section D: HT&BL Elements */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              Section D: 12 HT&BL Statutory Indicators
            </h3>
            
            {h?.noElements ? (
              <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                ✓ Recorded as 'No Elements Identified' during field visit.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {htblList.map((item, idx) => {
                  const isPresent = Boolean(item.data?.present);
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs ${
                        isPresent
                          ? 'bg-rose-50/50 border-rose-200 text-rose-900'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{item.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          isPresent ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isPresent ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {isPresent && (
                        <div className="mt-1 text-[11px] text-rose-700">
                          {item.isAdvance && item.data?.amount && (
                            <div className="font-bold">Amount: ₹ {item.data.amount}</div>
                          )}
                          {item.data?.details && <div>{item.data.details}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section E: Field Information */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              Section E: Qualitative Field Findings & Status
            </h3>
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Conversation Highlights:</span>
                <p className="text-slate-600 mt-0.5 whitespace-pre-wrap">{record.conversationHighlights || 'None documented'}</p>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800 block">Observations:</span>
                <p className="text-slate-600 mt-0.5 whitespace-pre-wrap">{record.observations || 'None documented'}</p>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800 block">Challenges Faced:</span>
                <p className="text-slate-600 mt-0.5">{record.challengesFaced || 'None'}</p>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800 block">Additional Remarks:</span>
                <p className="text-slate-600 mt-0.5">{record.additionalRemarks || 'None'}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-6 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50 shrink-0">
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors flex items-center justify-center"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
