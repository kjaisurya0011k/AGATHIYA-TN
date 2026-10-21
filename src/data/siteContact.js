/**
 * Single Source of Truth for EEE-TN site contact & support details.
 * To update phone numbers, official email, or support hours, edit the values below.
 */

export const helpline = {
  phones: [
    {
      display: "+91 82488 53729",
      tel: "+918248853729",
      whatsapp: "918248853729",
      label: "Student Support",
      label_ta: "மாணவர் உதவி மையம்"
    },
    {
      display: "+91 74180 44711",
      tel: "+917418044711",
      whatsapp: "917418044711",
      label: "School & Partnership Enquiries",
      label_ta: "பள்ளி & கூட்டாண்மை வினவல்கள்"
    }
  ],
  email: "eeetnofficial148@gmail.com",
  hours: "Mon-Sat, 9 AM - 7 PM IST",
  hours_ta: "திங்கள்–சனி, காலை 9:00 – மாலை 7:00 IST",
  responseEstimate: "Replies typically within 24 business hours",
  responseEstimate_ta: "24 அலுவலக மணிநேரத்திற்குள் பதில் அனுப்பப்படும்"
};

export const siteContact = {
  helpline
};

export default siteContact;
