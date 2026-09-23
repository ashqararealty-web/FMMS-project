import React, { useState, useEffect, useMemo } from 'react';
import {
  VisitRecord,
  HTBLElements,
  IndustryType,
  SeasonType,
  CaseStatus,
  REPORTING_PERSON_OPTIONS,
  CLUSTER_OPTIONS,
  CLUSTER_MANDAL_MAP,
  ClusterName,
  MANDAL_OPTIONS,
  REVENUE_DIVISION_OPTIONS,
  POLICE_STATION_OPTIONS,
} from '../types';
import { initialHTBLElements, computeIsHtblPotential } from '../services/storage';
import {
  Building2,
  Calendar,
  MapPin,
  Users,
  Phone,
  ShieldAlert,
  FileText,
  Save,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Info,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface VisitFormViewProps {
  initialRecord?: VisitRecord | null;
  onSave: (recordData: Omit<VisitRecord, 'id' | 'createdAt' | 'updatedAt' | 'isHtblPotential'> & { id?: string }) => void | Promise<any>;
  onCancel?: () => void;
  nextVisitNumber?: number;
  onViewMasterExcel?: () => void;
}

const INDUSTRY_OPTIONS: IndustryType[] = [
  'Brick Kiln',
  'Construction',
  'Garments / Textile',
  'Rice Mill',
  'Stone Quarry / Crusher',
  'Agriculture / Farm',
  'Hotel / Dhaba',
  'Poultry / Dairy',
  'Manufacturing / Factory',
  'Wood & Timber',
  'Fish / Prawn Processing',
  'Other',
];

const SEASON_OPTIONS: SeasonType[] = [
  'Seasonal',
  'Perennial / Year-Round',
  'Peak Season',
  'Off Season',
  'Unspecified',
];

const CASE_STATUS_OPTIONS: CaseStatus[] = [
  'Initial Screening',
  'Under Verification',
  'High Risk / Immediate Follow-up',
  'Referred to District Administration',
  'Legal Action Initiated',
  'Routine Monitoring / Closed',
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const FORM_SECTIONS = [
  { id: 'A', title: 'A. Visit Details', icon: Calendar, subtitle: 'Location & Worksite Profile' },
  { id: 'B', title: 'B. Worker Demographics', icon: Users, subtitle: 'Headcount & Migration Origin' },
  { id: 'C', title: 'C. Key Contacts', icon: Phone, subtitle: 'Mukadam & Owner Numbers' },
  { id: 'D', title: 'D. HT&BL Indicators', icon: ShieldAlert, subtitle: 'Trafficking & Bonded Labour Signs' },
  { id: 'E', title: 'E. Field Findings', icon: FileText, subtitle: 'Conversations & Case Status' },
];

export const VisitFormView: React.FC<VisitFormViewProps> = ({
  initialRecord,
  onSave,
  onCancel,
  nextVisitNumber,
  onViewMasterExcel,
}) => {
  const isEditing = Boolean(initialRecord && initialRecord.id);

  // Form State
  const [activeSection, setActiveSection] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');

  // Section A
  const [reportingPerson, setReportingPerson] = useState(initialRecord?.reportingPerson || '');
  const [dateOfVisit, setDateOfVisit] = useState(initialRecord?.dateOfVisit || new Date().toISOString().split('T')[0]);
  const [noOfVisit, setNoOfVisit] = useState(initialRecord?.noOfVisit || '1st Visit');
  const [month, setMonth] = useState(initialRecord?.month || MONTHS[new Date().getMonth()]);
  const [clusterName, setClusterName] = useState(initialRecord?.clusterName || '');
  const [industryType, setIndustryType] = useState<string>(initialRecord?.industryType || 'Brick Kiln');
  const [industryName, setIndustryName] = useState(initialRecord?.industryName || '');
  const [locationLink, setLocationLink] = useState(initialRecord?.locationLink || '');
  const [areaVillageWard, setAreaVillageWard] = useState(initialRecord?.areaVillageWard || '');
  const [mandal, setMandal] = useState(initialRecord?.mandal || '');
  const [revenueDivision, setRevenueDivision] = useState(initialRecord?.revenueDivision || '');
  const [policeStation, setPoliceStation] = useState(initialRecord?.policeStation || '');
  const [seasonality, setSeasonality] = useState<string>(initialRecord?.seasonality || 'Seasonal');

  // Section B
  const [interactedPersonsCount, setInteractedPersonsCount] = useState<string>(
    initialRecord ? String(initialRecord.interactedPersonsCount || '') : ''
  );
  const [approxWorkersCount, setApproxWorkersCount] = useState<string>(
    initialRecord ? String(initialRecord.approxWorkersCount || '') : ''
  );
  const [maleWorkersCount, setMaleWorkersCount] = useState<string>(
    initialRecord ? String(initialRecord.maleWorkersCount || '') : ''
  );
  const [femaleWorkersCount, setFemaleWorkersCount] = useState<string>(
    initialRecord ? String(initialRecord.femaleWorkersCount || '') : ''
  );
  const [familiesCount, setFamiliesCount] = useState<string>(
    initialRecord ? String(initialRecord.familiesCount || '') : ''
  );
  const [otherStateLabour, setOtherStateLabour] = useState(initialRecord?.otherStateLabour || '');
  const [intraStateLabour, setIntraStateLabour] = useState(initialRecord?.intraStateLabour || '');

  // Section C
  const [contactPersonName, setContactPersonName] = useState(initialRecord?.contactPersonName || '');
  const [contactPersonPhone, setContactPersonPhone] = useState(initialRecord?.contactPersonPhone || '');
  const [ownerName, setOwnerName] = useState(initialRecord?.ownerName || '');
  const [ownerPhone, setOwnerPhone] = useState(initialRecord?.ownerPhone || '');

  // Section D - HT&BL elements
  const [htblElements, setHtblElements] = useState<HTBLElements>(
    initialRecord?.htblElements
      ? JSON.parse(JSON.stringify(initialRecord.htblElements))
      : JSON.parse(JSON.stringify(initialHTBLElements))
  );

  // Section E
  const [conversationHighlights, setConversationHighlights] = useState(initialRecord?.conversationHighlights || '');
  const [observations, setObservations] = useState(initialRecord?.observations || '');
  const [challengesFaced, setChallengesFaced] = useState(initialRecord?.challengesFaced || '');
  const [caseStatus, setCaseStatus] = useState<CaseStatus>(initialRecord?.caseStatus || 'Initial Screening');
  const [additionalRemarks, setAdditionalRemarks] = useState(initialRecord?.additionalRemarks || '');

  // Validation & feedback state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showGenderMismatchConfirm, setShowGenderMismatchConfirm] = useState(false);
  const [genderMismatchConfirmed, setGenderMismatchConfirmed] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [sectionTransitionNote, setSectionTransitionNote] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  // Dependent mandals based on selected cluster
  const availableMandals = useMemo(() => {
    if (!clusterName) return [];
    if (clusterName in CLUSTER_MANDAL_MAP) {
      return CLUSTER_MANDAL_MAP[clusterName as ClusterName] || [];
    }
    return [];
  }, [clusterName]);

  // Handle cluster change with automatic mandal reset
  const handleClusterChange = (newCluster: string) => {
    setClusterName(newCluster);
    // When the Cluster is changed, automatically clear/reset the previously selected Mandal
    setMandal('');
    clearError('clusterName');
    clearError('mandal');
  };

  // Auto-update month when date changes
  const handleDateChange = (newDate: string) => {
    setDateOfVisit(newDate);
    try {
      const d = new Date(newDate);
      if (!isNaN(d.getTime())) {
        setMonth(MONTHS[d.getMonth()]);
      }
    } catch {
      // ignore
    }
  };

  // Helper to toggle HT&BL elements
  const toggleHtblElement = (
    key: keyof Omit<HTBLElements, 'noElements'>,
    present: boolean
  ) => {
    setHtblElements((prev) => {
      const updated = {
        ...prev,
        [key]: {
          ...prev[key],
          present,
        },
      };

      // If any element is marked present, turn off 'noElements'
      if (present) {
        updated.noElements = false;
      }
      return updated;
    });
  };

  const updateHtblDetails = (
    key: keyof Omit<HTBLElements, 'noElements'>,
    field: 'details' | 'amount',
    val: string
  ) => {
    setHtblElements((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: val,
      },
    }));
  };

  const toggleNoElements = (val: boolean) => {
    if (val) {
      // Clear all elements
      const reset = JSON.parse(JSON.stringify(initialHTBLElements));
      reset.noElements = true;
      setHtblElements(reset);
    } else {
      setHtblElements((prev) => ({
        ...prev,
        noElements: false,
      }));
    }
  };

  // Validate individual section before advancing
  const validateSection = (sec: 'A' | 'B' | 'C' | 'D' | 'E'): boolean => {
    if (sec === 'A') {
      const errs: Record<string, string> = {};
      if (!reportingPerson.trim()) {
        errs.reportingPerson = 'Reporting Person is required';
      }
      if (!dateOfVisit) {
        errs.dateOfVisit = 'Date of visit is required';
      }
      if (!clusterName.trim()) {
        errs.clusterName = 'Name of Cluster is required';
      }
      if (!mandal.trim()) {
        errs.mandal = !clusterName.trim()
          ? 'Please select a Cluster first'
          : 'Mandal is required';
      }

      setErrors((prev) => {
        const next = { ...prev };
        delete next.reportingPerson;
        delete next.dateOfVisit;
        delete next.clusterName;
        delete next.mandal;
        return { ...next, ...errs };
      });

      return Object.keys(errs).length === 0;
    }

    if (sec === 'B') {
      const errs: Record<string, string> = {};
      const totalWorkers = Number(approxWorkersCount) || 0;
      const males = Number(maleWorkersCount) || 0;
      const females = Number(femaleWorkersCount) || 0;

      if (males + females > totalWorkers && totalWorkers > 0 && !genderMismatchConfirmed) {
        setShowGenderMismatchConfirm(true);
        errs.approxWorkersCount = `Male (${males}) + Female (${females}) sum (${males + females}) exceeds Approx Workers (${totalWorkers}).`;
      }

      setErrors((prev) => {
        const next = { ...prev };
        delete next.approxWorkersCount;
        return { ...next, ...errs };
      });

      return Object.keys(errs).length === 0;
    }

    if (sec === 'C') {
      const errs: Record<string, string> = {};
      const validatePhone = (num: string, fieldName: string) => {
        const clean = num.replace(/[\s\-\+]/g, '');
        if (clean && clean.length > 0) {
          if (!/^[6-9]\d{9}$/.test(clean) && !/^91[6-9]\d{9}$/.test(clean)) {
            errs[fieldName] = 'Enter a valid 10-digit mobile number';
          }
        }
      };

      validatePhone(contactPersonPhone, 'contactPersonPhone');
      validatePhone(ownerPhone, 'ownerPhone');

      setErrors((prev) => {
        const next = { ...prev };
        delete next.contactPersonPhone;
        delete next.ownerPhone;
        return { ...next, ...errs };
      });

      return Object.keys(errs).length === 0;
    }

    return true;
  };

  // Validate entire form for final save
  const validateForm = (): { isValid: boolean; errs: Record<string, string> } => {
    const errs: Record<string, string> = {};

    if (!reportingPerson.trim()) {
      errs.reportingPerson = 'Reporting Person is required';
    }
    if (!dateOfVisit) {
      errs.dateOfVisit = 'Date of visit is required';
    }
    if (!clusterName.trim()) {
      errs.clusterName = 'Name of Cluster is required';
    }
    if (!mandal.trim()) {
      errs.mandal = !clusterName.trim()
        ? 'Please select a Cluster first'
        : 'Mandal is required';
    }

    // Phone number validations (if entered)
    const validatePhone = (num: string, fieldName: string) => {
      const clean = num.replace(/[\s\-\+]/g, '');
      if (clean && clean.length > 0) {
        // Indian phone numbers typically 10 digits (or 12 with 91)
        if (!/^[6-9]\d{9}$/.test(clean) && !/^91[6-9]\d{9}$/.test(clean)) {
          errs[fieldName] = 'Enter a valid 10-digit mobile number';
        }
      }
    };

    validatePhone(contactPersonPhone, 'contactPersonPhone');
    validatePhone(ownerPhone, 'ownerPhone');

    // Worker counts logic
    const totalWorkers = Number(approxWorkersCount) || 0;
    const males = Number(maleWorkersCount) || 0;
    const females = Number(femaleWorkersCount) || 0;

    if (males + females > totalWorkers && totalWorkers > 0 && !genderMismatchConfirmed) {
      setShowGenderMismatchConfirm(true);
      errs.approxWorkersCount = `Male (${males}) + Female (${females}) sum (${males + females}) exceeds Approx Workers (${totalWorkers}).`;
    }

    setErrors(errs);
    return { isValid: Object.keys(errs).length === 0, errs };
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const { isValid, errs } = validateForm();
    if (!isValid) {
      // Jump to first section with errors
      if (errs.reportingPerson || errs.dateOfVisit || errs.clusterName || errs.mandal) {
        setActiveSection('A');
      } else if (errs.approxWorkersCount) {
        setActiveSection('B');
      } else if (errs.contactPersonPhone || errs.ownerPhone) {
        setActiveSection('C');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const recordId = initialRecord?.id || (nextVisitNumber ? `FV-${nextVisitNumber}` : `FV-${Date.now().toString().slice(-4)}`);

      // Preserve existing name if editing, otherwise generate a clear worksite identifier
      const resolvedIndustryName =
        industryName.trim() ||
        initialRecord?.industryName?.trim() ||
        `${industryType} (${areaVillageWard.trim() || mandal.trim() || 'Worksite'})`;

      const payload = {
        id: recordId,
        reportingPerson: reportingPerson.trim(),
        dateOfVisit,
        noOfVisit: noOfVisit.trim(),
        month,
        clusterName: clusterName.trim(),
        industryType,
        industryName: resolvedIndustryName,
        locationLink: locationLink.trim(),
        areaVillageWard: areaVillageWard.trim(),
        mandal: mandal.trim(),
        revenueDivision: revenueDivision.trim(),
        policeStation: policeStation.trim(),
        seasonality,
        interactedPersonsCount: Number(interactedPersonsCount) || 0,
        approxWorkersCount: Number(approxWorkersCount) || 0,
        maleWorkersCount: Number(maleWorkersCount) || 0,
        femaleWorkersCount: Number(femaleWorkersCount) || 0,
        familiesCount: Number(familiesCount) || 0,
        otherStateLabour: otherStateLabour.trim(),
        intraStateLabour: intraStateLabour.trim(),
        contactPersonName: contactPersonName.trim(),
        contactPersonPhone: contactPersonPhone.trim(),
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim(),
        htblElements,
        conversationHighlights: conversationHighlights.trim(),
        observations: observations.trim(),
        challengesFaced: challengesFaced.trim(),
        caseStatus,
        additionalRemarks: additionalRemarks.trim(),
      };

      await onSave(payload);

      setSaveSuccessMessage(
        isEditing
          ? `✓ Record ${initialRecord?.id} updated in Cloud Firestore & Master Excel`
          : `✓ Visit saved to Cloud Firestore & Master Excel automatically updated (Record ID: ${recordId})`
      );

      if (!isEditing) {
        // Reset form fields for fresh entry
        setIndustryName('');
        setLocationLink('');
        setAreaVillageWard('');
        setInteractedPersonsCount('');
        setApproxWorkersCount('');
        setMaleWorkersCount('');
        setFemaleWorkersCount('');
        setFamiliesCount('');
        setOtherStateLabour('');
        setIntraStateLabour('');
        setContactPersonName('');
        setContactPersonPhone('');
        setOwnerName('');
        setOwnerPhone('');
        setHtblElements(JSON.parse(JSON.stringify(initialHTBLElements)));
        setConversationHighlights('');
        setObservations('');
        setChallengesFaced('');
        setAdditionalRemarks('');
        setGenderMismatchConfirmed(false);
        setActiveSection('A');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Clear alert after 4.5 seconds
      setTimeout(() => {
        setSaveSuccessMessage(null);
      }, 4500);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for Save button: advances to next section until Section E, where it triggers Final Save
  const handleSaveClick = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // If on the final section 'E', trigger Final Save
    if (activeSection === 'E') {
      await handleSubmit();
      return;
    }

    // Validate current section before moving forward
    const isValid = validateSection(activeSection);
    if (!isValid) {
      return;
    }

    // Automatically advance to the next section
    const idx = FORM_SECTIONS.findIndex((s) => s.id === activeSection);
    if (idx < FORM_SECTIONS.length - 1) {
      const nextSec = FORM_SECTIONS[idx + 1].id as 'A' | 'B' | 'C' | 'D' | 'E';
      const nextTitle = FORM_SECTIONS[idx + 1].title;
      setActiveSection(nextSec);
      setSectionTransitionNote(`✓ Section ${activeSection} saved. Proceeding to ${nextTitle}.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        setSectionTransitionNote(null);
      }, 3500);
    }
  };

  const handleNextSection = () => {
    handleSaveClick();
  };

  const handlePrevSection = () => {
    const idx = FORM_SECTIONS.findIndex((s) => s.id === activeSection);
    if (idx > 0) {
      setActiveSection(FORM_SECTIONS[idx - 1].id as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              {isEditing ? `Editing Record: ${initialRecord?.id}` : 'Master Excel Form Entry'}
            </div>
            {!isEditing && (
              <div
                id="badge-next-visit-no"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-full font-mono shadow-2xs"
              >
                Next Visit No: {nextVisitNumber || 2315}
              </div>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {isEditing ? `Edit Worksite Visit: ${initialRecord?.industryName}` : 'New Field Visit & Worksite Record'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fill in worksite inspection details. All entries map directly to template <span className="font-mono font-semibold text-slate-700">1.xlsx</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center"
            >
              Cancel
            </button>
          )}
          <button
            id="form-top-submit-btn"
            type="button"
            disabled={isSubmitting}
            onClick={handleSaveClick}
            className="flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : activeSection === 'E' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>{isEditing ? 'Final Save Changes' : 'Final Save'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save &amp; Next</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-80" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Success Alert Banner */}
      {saveSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-950">{saveSuccessMessage}</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Saved to Cloud Firestore and automatically reflected in Master Excel (Daily Visits&Mapping + Thematic Sheets). No export is required.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {onViewMasterExcel && (
              <button
                type="button"
                onClick={onViewMasterExcel}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 min-h-[36px]"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                View in Master Excel
              </button>
            )}
            <button
              type="button"
              onClick={() => setSaveSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-950 p-1 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Section Transition Toast Notice */}
      {sectionTransitionNote && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{sectionTransitionNote}</span>
          </div>
          <button
            type="button"
            onClick={() => setSectionTransitionNote(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Section Navigation Tabs (Horizontal Stepper with Smooth Touch Scrolling) */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-2xs overflow-x-auto no-scrollbar">
        <div className="flex sm:grid sm:grid-cols-5 gap-1.5 min-w-max sm:min-w-0">
          {FORM_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                id={`form-tab-section-${sec.id}`}
                type="button"
                onClick={() => setActiveSection(sec.id as any)}
                className={`flex flex-col items-center justify-center min-h-[46px] py-2 px-3 sm:px-2 rounded-lg text-center transition-all shrink-0 sm:shrink ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-100' : 'text-slate-500'}`} />
                  <span className="text-xs tracking-tight whitespace-nowrap">{sec.id}. {sec.title.split('. ')[1]}</span>
                  {sec.id === 'E' && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                      Final
                    </span>
                  )}
                </div>
                <span className={`text-[10px] hidden sm:block truncate ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {sec.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSaveClick} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-7 shadow-xs space-y-6">

        {/* SECTION A: VISIT DETAILS */}
        {activeSection === 'A' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">
                  A
                </span>
                SECTION A – VISIT DETAILS
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Document reporting staff, visit date, cluster, and administrative jurisdiction.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Reporting Person */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Reporting Person <span className="text-rose-500">*</span>
                  </label>
                  {reportingPerson && (
                    <span className="text-[11px] text-emerald-700 font-medium">
                      Selected: <strong className="text-emerald-900">{reportingPerson}</strong>
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <select
                    id="field-reportingPerson"
                    required
                    value={
                      (REPORTING_PERSON_OPTIONS as readonly string[]).includes(reportingPerson)
                        ? reportingPerson
                        : reportingPerson
                        ? '__custom__'
                        : ''
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__custom__') {
                        if ((REPORTING_PERSON_OPTIONS as readonly string[]).includes(reportingPerson)) {
                          setReportingPerson('');
                        }
                      } else {
                        setReportingPerson(val);
                      }
                      clearError('reportingPerson');
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.reportingPerson ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    }`}
                  >
                    <option value="">-- Select Reporting Person --</option>
                    {REPORTING_PERSON_OPTIONS.map((person) => (
                      <option key={person} value={person}>
                        {person}
                      </option>
                    ))}
                    <option value="__custom__">Other (Enter custom name...)</option>
                  </select>

                  {/* Custom input if not in standard list */}
                  {!((REPORTING_PERSON_OPTIONS as readonly string[]).includes(reportingPerson)) && (
                    <input
                      id="field-reportingPerson-custom"
                      type="text"
                      placeholder="Enter custom officer / staff name"
                      value={reportingPerson}
                      onChange={(e) => {
                        setReportingPerson(e.target.value);
                        clearError('reportingPerson');
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  )}
                </div>
                {errors.reportingPerson && (
                  <p className="text-xs text-rose-600 mt-1">{errors.reportingPerson}</p>
                )}
              </div>

              {/* Date of Visit */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Date of Visit <span className="text-rose-500">*</span>
                </label>
                <input
                  id="field-dateOfVisit"
                  type="date"
                  required
                  value={dateOfVisit}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.dateOfVisit ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.dateOfVisit && (
                  <p className="text-xs text-rose-600 mt-1">{errors.dateOfVisit}</p>
                )}
              </div>

              {/* No. of Visit */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  No. of Visit <span className="text-rose-500">*</span>
                </label>
                <select
                  id="field-noOfVisit"
                  value={noOfVisit}
                  onChange={(e) => setNoOfVisit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="1st Visit">1st Visit</option>
                  <option value="2nd Visit">2nd Visit</option>
                  <option value="3rd Visit">3rd Visit</option>
                  <option value="Follow-up Visit">Follow-up Visit</option>
                  <option value="Joint Inspection">Joint Inspection</option>
                </select>
              </div>

              {/* Month */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Month <span className="text-rose-500">*</span>
                </label>
                <select
                  id="field-month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name of Cluster */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="field-clusterName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Name of Cluster <span className="text-rose-500">*</span>
                  </label>
                  {clusterName && (
                    <span className="text-[11px] text-emerald-700 font-medium">
                      Selected: <strong className="text-emerald-900">{clusterName}</strong>
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <select
                    id="field-clusterName"
                    value={
                      (CLUSTER_OPTIONS as readonly string[]).includes(clusterName)
                        ? clusterName
                        : clusterName
                        ? '__custom__'
                        : ''
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__custom__') {
                        if ((CLUSTER_OPTIONS as readonly string[]).includes(clusterName)) {
                          handleClusterChange('');
                        }
                      } else {
                        handleClusterChange(val);
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 min-h-[44px] text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.clusterName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    }`}
                  >
                    <option value="">-- Select Cluster --</option>
                    {CLUSTER_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__custom__">Other (Enter custom cluster...)</option>
                  </select>

                  {/* Custom input if not in standard list */}
                  {!((CLUSTER_OPTIONS as readonly string[]).includes(clusterName)) && clusterName !== '' && (
                    <input
                      id="field-clusterName-custom"
                      type="text"
                      placeholder="Enter custom cluster name"
                      value={clusterName}
                      onChange={(e) => handleClusterChange(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  )}

                  {errors.clusterName && (
                    <p className="text-xs text-rose-600 mt-1">{errors.clusterName}</p>
                  )}
                </div>
              </div>

              {/* Mandal (Dependent on Cluster) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="field-mandal" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mandal <span className="text-rose-500">*</span>
                  </label>
                  {clusterName ? (
                    <span className="text-[11px] text-emerald-700 font-medium">
                      {availableMandals.length > 0
                        ? `${availableMandals.length} ${clusterName} Mandals`
                        : `Cluster: ${clusterName}`}
                      {mandal && (
                        <> • Selected: <strong className="text-emerald-900">{mandal}</strong></>
                      )}
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-600 font-medium">
                      Select Cluster First
                    </span>
                  )}
                </div>

                <select
                  id="field-mandal"
                  disabled={!clusterName}
                  value={
                    availableMandals.includes(mandal)
                      ? mandal
                      : mandal
                      ? '__custom__'
                      : ''
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__custom__') {
                      if (availableMandals.includes(mandal)) {
                        setMandal('');
                      }
                    } else {
                      setMandal(val);
                      if (errors.mandal) {
                        clearError('mandal');
                      }
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 min-h-[44px] text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                    !clusterName
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : errors.mandal
                      ? 'border-rose-400 bg-rose-50/30'
                      : 'border-slate-300'
                  }`}
                >
                  {!clusterName ? (
                    <option value="">Select Cluster First</option>
                  ) : (
                    <>
                      <option value="">-- Select Mandal ({availableMandals.length} options) --</option>
                      {availableMandals.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                      <option value="__custom__">Other (Enter custom mandal...)</option>
                    </>
                  )}
                </select>

                {/* If no cluster selected, prompt user */}
                {!clusterName && (
                  <p className="text-xs text-amber-600 flex items-center gap-1.5 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Please select a cluster above first to choose a mandal.
                  </p>
                )}

                {/* Custom input if not in standard list and cluster is selected */}
                {clusterName && !availableMandals.includes(mandal) && mandal !== '' && (
                  <input
                    id="field-mandal-custom"
                    type="text"
                    placeholder="Enter custom mandal name"
                    value={mandal}
                    onChange={(e) => {
                      setMandal(e.target.value);
                      if (errors.mandal && e.target.value.trim()) {
                        clearError('mandal');
                      }
                    }}
                    className={`w-full px-3 py-1.5 text-xs rounded-lg border bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      errors.mandal ? 'border-rose-400' : 'border-slate-300'
                    }`}
                  />
                )}

                {errors.mandal && (
                  <p className="text-xs text-rose-600 mt-1">{errors.mandal}</p>
                )}
              </div>

              {/* Village (Area / Village / Ward - Under Mandal) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Village (Area / Village / Ward) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="field-areaVillageWard"
                  type="text"
                  placeholder="e.g. Raghavapur Village"
                  value={areaVillageWard}
                  onChange={(e) => setAreaVillageWard(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Revenue Division (Under Village, with dropdown) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="field-revenueDivision" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Revenue Division <span className="text-rose-500">*</span>
                  </label>
                  {revenueDivision && (
                    <span className="text-[11px] text-emerald-700 font-medium">
                      Selected: <strong className="text-emerald-900">{revenueDivision}</strong>
                    </span>
                  )}
                </div>

                <select
                  id="field-revenueDivision"
                  value={
                    (REVENUE_DIVISION_OPTIONS as readonly string[]).includes(revenueDivision)
                      ? revenueDivision
                      : revenueDivision
                      ? '__custom__'
                      : ''
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__custom__') {
                      if ((REVENUE_DIVISION_OPTIONS as readonly string[]).includes(revenueDivision)) {
                        setRevenueDivision('');
                      }
                    } else {
                      setRevenueDivision(val);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 min-h-[44px] text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Revenue Division ({REVENUE_DIVISION_OPTIONS.length} options) --</option>
                  {REVENUE_DIVISION_OPTIONS.map((rd) => (
                    <option key={rd} value={rd}>
                      {rd}
                    </option>
                  ))}
                  <option value="__custom__">Other (Enter custom revenue division...)</option>
                </select>

                {/* Custom input if not in standard list */}
                {!((REVENUE_DIVISION_OPTIONS as readonly string[]).includes(revenueDivision)) && (
                  <input
                    id="field-revenueDivision-custom"
                    type="text"
                    placeholder="Enter custom revenue division"
                    value={revenueDivision}
                    onChange={(e) => setRevenueDivision(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                )}
              </div>

              {/* Police Station */}
              <div className="space-y-1.5">
                <label htmlFor="field-policeStation" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Police Station <span className="text-rose-500">*</span>
                </label>
                <select
                  id="field-policeStation"
                  value={
                    (POLICE_STATION_OPTIONS as readonly string[]).includes(policeStation)
                      ? policeStation
                      : policeStation
                      ? '__custom__'
                      : ''
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__custom__') {
                      if ((POLICE_STATION_OPTIONS as readonly string[]).includes(policeStation)) {
                        setPoliceStation('');
                      }
                    } else {
                      setPoliceStation(val);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 min-h-[44px] text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Police Station --</option>
                  {POLICE_STATION_OPTIONS.map((ps) => (
                    <option key={ps} value={ps}>
                      {ps}
                    </option>
                  ))}
                  <option value="__custom__">Other (Enter custom police station...)</option>
                </select>

                {!((POLICE_STATION_OPTIONS as readonly string[]).includes(policeStation)) && (
                  <input
                    id="field-policeStation-custom"
                    type="text"
                    placeholder="Enter custom police station name"
                    value={policeStation}
                    onChange={(e) => setPoliceStation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                )}
              </div>

              {/* Location of Worksite / Industry (Under Revenue Division) */}
              <div className="sm:col-span-2">
                <label htmlFor="field-locationLink" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Location of Worksite / Industry (Google Maps Link or GPS Coords) <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="field-locationLink"
                    type="text"
                    placeholder="https://maps.google.com/?q=18.6166,79.3833 or GPS / Landmark"
                    value={locationLink}
                    onChange={(e) => setLocationLink(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {locationLink && (
                    <a
                      href={locationLink.startsWith('http') ? locationLink : `https://maps.google.com/?q=${encodeURIComponent(locationLink)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors shrink-0"
                      title="Open location in Google Maps"
                    >
                      <ExternalLink className="w-4 h-4 text-emerald-600" />
                      Open Map
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Paste any Google Maps URL, pin link, or GPS coordinates/landmark of the worksite.
                </p>
              </div>

              {/* Type of Industry/Worksite */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Type of Industry/Worksite <span className="text-rose-500">*</span>
                </label>
                <select
                  id="field-industryType"
                  value={industryType}
                  onChange={(e) => setIndustryType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Worksite/Industry Season */}
              <div className="sm:col-span-2">
                <label htmlFor="field-seasonality" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Worksite/Industry Season <span className="text-rose-500">*</span>
                </label>
                <select
                  id="field-seasonality"
                  value={seasonality}
                  onChange={(e) => setSeasonality(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Season --</option>
                  {SEASON_OPTIONS.map((season) => (
                    <option key={season} value={season}>
                      {season}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>
        )}

        {/* SECTION B: WORKER DETAILS */}
        {activeSection === 'B' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">
                  B
                </span>
                SECTION B – WORKER DETAILS
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Record workforce headcounts, gender distribution, families on site, and migration geography.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* No. of Interacted Persons */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  No. of Interacted Persons
                </label>
                <input
                  id="field-interactedPersonsCount"
                  type="number"
                  min="0"
                  placeholder="e.g. 12"
                  value={interactedPersonsCount}
                  onChange={(e) => setInteractedPersonsCount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">Workers directly spoken to by staff</p>
              </div>

              {/* Approx. No. of Workers */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Approx. No. of Workers
                </label>
                <input
                  id="field-approxWorkersCount"
                  type="number"
                  min="0"
                  placeholder="e.g. 45"
                  value={approxWorkersCount}
                  onChange={(e) => {
                    setApproxWorkersCount(e.target.value);
                    setGenderMismatchConfirmed(false);
                  }}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.approxWorkersCount ? 'border-amber-400 bg-amber-50/30' : 'border-slate-300'
                  }`}
                />
                <p className="text-[11px] text-slate-400 mt-1">Estimated total workforce on site</p>
              </div>

              {/* Male Workers */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Male Workers
                </label>
                <input
                  id="field-maleWorkersCount"
                  type="number"
                  min="0"
                  placeholder="e.g. 25"
                  value={maleWorkersCount}
                  onChange={(e) => {
                    setMaleWorkersCount(e.target.value);
                    setGenderMismatchConfirmed(false);
                  }}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Female Workers */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Female Workers
                </label>
                <input
                  id="field-femaleWorkersCount"
                  type="number"
                  min="0"
                  placeholder="e.g. 20"
                  value={femaleWorkersCount}
                  onChange={(e) => {
                    setFemaleWorkersCount(e.target.value);
                    setGenderMismatchConfirmed(false);
                  }}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Gender count discrepancy alert */}
              {Number(maleWorkersCount) + Number(femaleWorkersCount) > Number(approxWorkersCount) && Number(approxWorkersCount) > 0 && (
                <div className="sm:col-span-2 bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Validation Notice: </span>
                      Male ({maleWorkersCount}) + Female ({femaleWorkersCount}) = {Number(maleWorkersCount) + Number(femaleWorkersCount)}, which exceeds total estimated workers ({approxWorkersCount}).
                      <div className="mt-1.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setApproxWorkersCount(String(Number(maleWorkersCount) + Number(femaleWorkersCount)));
                            setGenderMismatchConfirmed(true);
                          }}
                          className="px-2.5 py-1 bg-amber-600 text-white rounded text-[11px] font-semibold hover:bg-amber-700"
                        >
                          Auto-Adjust Total to {Number(maleWorkersCount) + Number(femaleWorkersCount)}
                        </button>
                        <button
                          type="button"
                          onClick={() => setGenderMismatchConfirmed(true)}
                          className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-[11px] font-semibold"
                        >
                          Keep As Is (Confirm)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Families Living in Worksite */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Approx. No. of Families Living in Worksite
                </label>
                <input
                  id="field-familiesCount"
                  type="number"
                  min="0"
                  placeholder="e.g. 15"
                  value={familiesCount}
                  onChange={(e) => setFamiliesCount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">Families residing in huts/sheds on premises</p>
              </div>

              {/* Other State Labour */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Other State Labour – State Names Only
                </label>
                <input
                  id="field-otherStateLabour"
                  type="text"
                  placeholder="e.g. Odisha, Bihar, Chhattisgarh, West Bengal (or None)"
                  value={otherStateLabour}
                  onChange={(e) => setOtherStateLabour(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  List only origin states separated by comma. Enter 'None' if no inter-state labour.
                </p>
              </div>

              {/* Intra State Labour */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Intra State Labour – District Names Only
                </label>
                <input
                  id="field-intraStateLabour"
                  type="text"
                  placeholder="e.g. Mahabubnagar, Nalgonda, Rangareddy (or None)"
                  value={intraStateLabour}
                  onChange={(e) => setIntraStateLabour(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  List native districts of workers from within the state.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* SECTION C: CONTACT DETAILS */}
        {activeSection === 'C' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">
                  C
                </span>
                SECTION C – CONTACT DETAILS
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Record contact information for the worksite supervisor/mukadam and enterprise owner.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Name of Contact Person */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Name of Contact Person (Mukadam / Sirdar / Supervisor)
                </label>
                <input
                  id="field-contactPersonName"
                  type="text"
                  placeholder="e.g. Santosh Naik (Mukadam)"
                  value={contactPersonName}
                  onChange={(e) => setContactPersonName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Contact Person Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Person Phone Number
                </label>
                <input
                  id="field-contactPersonPhone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={contactPersonPhone}
                  onChange={(e) => setContactPersonPhone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.contactPersonPhone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.contactPersonPhone && (
                  <p className="text-xs text-rose-600 mt-1">{errors.contactPersonPhone}</p>
                )}
              </div>

              {/* Name of Owner */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Name of Owner / Proprietor
                </label>
                <input
                  id="field-ownerName"
                  type="text"
                  placeholder="e.g. K. Rajalingam"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Owner Contact Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Owner Contact Number
                </label>
                <input
                  id="field-ownerPhone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.ownerPhone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.ownerPhone && (
                  <p className="text-xs text-rose-600 mt-1">{errors.ownerPhone}</p>
                )}
              </div>

            </div>
          </div>
        )}

        {/* SECTION D: HT&BL ELEMENTS */}
        {activeSection === 'D' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">
                    D
                  </span>
                  SECTION D – HT&BL ELEMENTS
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Statutory Bonded Labour System (Abolition) & Human Trafficking indicators. Use simple Yes/No toggles.
                </p>
              </div>

              {/* Master "No Elements" Toggle Button */}
              <button
                type="button"
                id="toggle-master-no-elements"
                onClick={() => toggleNoElements(!htblElements.noElements)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                  htblElements.noElements
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  htblElements.noElements ? 'bg-white text-emerald-700' : 'border-slate-400'
                }`}>
                  {htblElements.noElements && <Check className="w-2.5 h-2.5" />}
                </span>
                No Elements Identified
              </button>
            </div>

            {/* Warning or Status Header */}
            {computeIsHtblPotential(htblElements) ? (
              <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 text-xs text-rose-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold">Potential HT&BL Case Flagged: </span>
                  One or more indicators are active. This visit will be categorized as requiring follow-up/verification.
                </div>
              </div>
            ) : htblElements.noElements ? (
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Standard worksite inspection: No exploitative elements identified.</span>
              </div>
            ) : null}

            {/* List of 12 Elements */}
            <div className="space-y-3">
              {[
                {
                  key: 'debtObligation' as const,
                  label: 'Debt / Obligation',
                  description: 'Workers tied by debt, loan, or financial obligation to employer/intermediary',
                },
                {
                  key: 'advance' as const,
                  label: 'Advance',
                  description: 'Upfront advance paid to worker or family in native village prior to recruitment',
                  isAdvance: true,
                },
                {
                  key: 'customSocialObligation' as const,
                  label: 'Custom / Social Obligation',
                  description: 'Obligation stemming from local customary practices, marriage, or social customs',
                },
                {
                  key: 'succession' as const,
                  label: 'Succession',
                  description: 'Labour obligations passed down from parent/ancestor or hereditary bondage',
                },
                {
                  key: 'economicConsideration' as const,
                  label: 'Economic Consideration',
                  description: 'Deprivation driven by extreme distress, land loss, crop failure, or food insecurity',
                },
                {
                  key: 'casteOrCommunity' as const,
                  label: 'Caste or Community',
                  description: 'Marginalized social groups (SC, ST, vulnerable communities) targeted for exploitation',
                },
                {
                  key: 'suretyOrContract' as const,
                  label: 'Surety / Contract',
                  description: 'Verbal contracts, retained identity documents, third-party guarantors, or sirdars',
                },
                {
                  key: 'interState' as const,
                  label: 'Inter-State',
                  description: 'Trans-border transportation of workers without registration under ISMW Act',
                },
                {
                  key: 'rightToMinimumWage' as const,
                  label: 'Right to Minimum Wage (Deprivation)',
                  description: 'Payment below statutory notified minimum wage or unlawful wage deductions',
                },
                {
                  key: 'freedomOfEmployment' as const,
                  label: 'Freedom of Employment (Restricted)',
                  description: 'Worker is prevented from seeking alternative jobs or leaving current worksite',
                },
                {
                  key: 'rightToMoveFreely' as const,
                  label: 'Right to Move Freely (Movement Restricted)',
                  description: 'Physical confinement, gatekeeper surveillance, or restricted exit to markets',
                },
                {
                  key: 'rightToAppropriateSellAtMarket' as const,
                  label: 'Right to Appropriate / Sell at Market',
                  description: 'Worker prohibited from marketing personal produce or services at market price',
                },
              ].map((item) => {
                const isChecked = htblElements[item.key].present;
                return (
                  <div
                    key={item.key}
                    className={`border rounded-xl p-3.5 transition-colors ${
                      isChecked
                        ? 'bg-rose-50/40 border-rose-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-800">
                            {item.label}
                          </span>
                          {isChecked && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                              Present (Yes)
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                      </div>

                      {/* Yes / No Toggle Pills */}
                      <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                        <button
                          type="button"
                          id={`toggle-${item.key}-yes`}
                          onClick={() => toggleHtblElement(item.key, true)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isChecked
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          id={`toggle-${item.key}-no`}
                          onClick={() => toggleHtblElement(item.key, false)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            !isChecked
                              ? 'bg-slate-200 text-slate-800'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    {/* Expandable fields when checked */}
                    {isChecked && (
                      <div className="mt-3 pt-3 border-t border-rose-100 space-y-2">
                        {item.isAdvance && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                                Advance Amount (in Rupees)
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">
                                  ₹
                                </span>
                                <input
                                  type="number"
                                  placeholder="e.g. 40000"
                                  value={htblElements.advance.amount || ''}
                                  onChange={(e) => updateHtblDetails('advance', 'amount', e.target.value)}
                                  className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-rose-300 bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                                Advance Conditions / Recipient
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Paid to parents in home village via broker"
                                value={htblElements.advance.details || ''}
                                onChange={(e) => updateHtblDetails('advance', 'details', e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-rose-300 bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                              />
                            </div>
                          </div>
                        )}

                        {!item.isAdvance && (
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                              Remarks / Specific Evidence Observed
                            </label>
                            <input
                              type="text"
                              placeholder={`Details about ${item.label.toLowerCase()}...`}
                              value={htblElements[item.key].details || ''}
                              onChange={(e) => updateHtblDetails(item.key, 'details', e.target.value)}
                              className="w-full px-3 py-1.5 text-xs rounded-lg border border-rose-300 bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION E: FIELD VISIT INFORMATION */}
        {activeSection === 'E' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">
                  E
                </span>
                SECTION E – FIELD VISIT INFORMATION
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Final Section
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Record qualitative narratives, field team observations, challenges, and determine legal case status. Click &quot;Final Save&quot; to complete and commit this visit record.
              </p>
            </div>

            <div className="space-y-4">
              
              {/* Highlights of the Conversations */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Highlights of the Conversations
                </label>
                <textarea
                  id="field-conversationHighlights"
                  rows={3}
                  placeholder="Key points shared by workers or mukadams regarding work hours, wages, travel, debt, or treatment..."
                  value={conversationHighlights}
                  onChange={(e) => setConversationHighlights(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Observation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Observation
                </label>
                <textarea
                  id="field-observations"
                  rows={3}
                  placeholder="Physical site conditions, worker housing/sheds, drinking water access, presence of minor children, PPE, sanitation..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Challenges Faced */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Challenges Faced
                </label>
                <input
                  id="field-challengesFaced"
                  type="text"
                  placeholder="e.g. Employer interference, hostile supervisor, remote terrain, language barrier..."
                  value={challengesFaced}
                  onChange={(e) => setChallengesFaced(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Case Status */}
              <div>
                <label htmlFor="field-caseStatus" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Case Status
                </label>
                <select
                  id="field-caseStatus"
                  value={caseStatus}
                  onChange={(e) => setCaseStatus(e.target.value as CaseStatus)}
                  className="w-full px-3.5 py-2.5 min-h-[44px] text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CASE_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Additional Remarks
                </label>
                <textarea
                  id="field-additionalRemarks"
                  rows={2}
                  placeholder="Follow-up actions needed, contact with District Labour Officer, next inspection date..."
                  value={additionalRemarks}
                  onChange={(e) => setAdditionalRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

            </div>
          </div>
        )}

        {/* Navigation & Submit Bar */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {activeSection !== 'A' && (
              <button
                type="button"
                id="form-prev-section-btn"
                onClick={handlePrevSection}
                className="flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous Section
              </button>
            )}
            {activeSection !== 'E' && (
              <button
                type="button"
                id="form-next-section-btn"
                onClick={handleNextSection}
                className="flex-1 sm:flex-initial min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
              >
                Next Section
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2.5 w-full sm:w-auto justify-end">
            <span className="text-[11px] text-emerald-800 font-medium inline-flex items-center gap-1.5 text-center sm:text-left">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span>
                {activeSection === 'E'
                  ? 'Final Save updates Cloud Firestore & Master Excel automatically'
                  : 'Click "Save & Next Section" to advance to next section'}
              </span>
            </span>
            <button
              id="form-bottom-save-btn"
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveClick}
              className={`w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-2.5 font-bold text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] disabled:opacity-50 ${
                activeSection === 'E'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-500/50 shadow-emerald-700/20 shadow-md'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : activeSection === 'E' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{isEditing ? 'Final Save Changes' : 'Final Save'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save &amp; Next Section</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};
