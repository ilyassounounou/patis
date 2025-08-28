import Employer from "../models/employerModel.js";

// ➕ Ajouter un employé
export const addEmployer = async (req, res) => {
  try {
    const { fullName, cin, birthDate, jobCategory, weeklySalary } = req.body;

    // Vérification des champs
    if (!fullName || !cin || !birthDate || !jobCategory || !weeklySalary) {
      return res.status(400).json({
        success: false,
        message: "جميع الحقول مطلوبة",
      });
    }

    // Création du nouvel employé
    const newEmployer = new Employer({
      fullName,
      cin,
      birthDate,
      jobCategory,
      weeklySalary,
    });

    await newEmployer.save();

    return res.status(201).json({
      success: true,
      message: "تمت إضافة الموظف بنجاح",
      employer: newEmployer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.code === 11000 ? "CIN موجود مسبقاً" : "خطأ في الخادم",
      error: error.message,
    });
  }
};

// 📜 Get all employers
export const getAllEmployers = async (req, res) => {
  try {
    const employers = await Employer.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: employers.length,
      employers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "خطأ في الخادم",
      error: error.message,
    });
  }
};

// 🗑 Delete employer
export const deleteEmployer = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEmployer = await Employer.findByIdAndDelete(id);

    if (!deletedEmployer) {
      return res.status(404).json({
        success: false,
        message: "الموظف غير موجود",
      });
    }

    return res.status(200).json({
      success: true,
      message: "تم حذف الموظف بنجاح",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "خطأ في الخادم",
      error: error.message,
    });
  }
};
