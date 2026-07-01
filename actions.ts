"use server"

import { cookies } from "next/headers"
import { educationRowSchema, FullForm, fullSchema, personalSchema, sponsorRowSchema, subjectSchema } from "./data/schemas"
import prismaClient from "./prisma"
import bcrypt from "bcrypt"

async function setCookie(name: string, value: string, ) {
    (await cookies()).set({
        name: name,
        value: value,
        maxAge: 60 * 60 * 24,
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
    })
}

// async function getCookie(name: string) {
//     const cookieStore = await cookies()
//     const cookieValue = cookieStore.get(name)
//     return cookieValue?.value || null
// }

export async function storeStudentData1(form:FullForm){
    try {
        
    const subjectData = subjectSchema.parse(form)
    const personalData = personalSchema.parse(form)
    
    let ref_number:string = "";
   const response = await fetch(process.env.REGISTER+`name=${personalData.firstName}&email=${personalData.email}&phone=${personalData.phone}`, { method: "GET" ,})
    if (!response.ok) {
            throw new Error("Failed to register student");
        }
    const data = await response.json();
    if (data.success) {
        ref_number = String(data.data);
    } else {
        throw new Error("Failed to register student:", data.message);
    }
        
    

    

    await prismaClient.student.create({
        data: {
            first_name: personalData.firstName,
            last_name: personalData.lastName,
            middle_name: personalData.otherNames || "",
            city: personalData.city,
            state_province: personalData.stateProvince || "",
            postal: personalData.postalCode || "",
            street_address: personalData.street,
            ref_number: ref_number,
            country: personalData.country,
            state_of_origin: personalData.stateOfOrigin,
            lga: personalData.lga,
            dob: new Date(`${personalData.dobYear}-${personalData.dobMonth}-${personalData.dobDay}`),
            hobbies: personalData.hobbies,email: personalData.email,
            phone_number: personalData.phone,
            marital_status: personalData.maritalStatus,         faculty: subjectData.faculty,
            gender: personalData.gender,subjects: subjectData.programme,
        }
    });
    return { success: true, message: process.env.PAY+ref_number }
}
    catch (error) {
        
        return { success: false, message: error instanceof Error ? error.message : "An error occurred"   }
    }
}
export async function storeStudentData2(form:FullForm, ){
    try {
        
    const fullData = fullSchema.parse(form)
    if(!fullData.ref_number || fullData.ref_number.trim() === "") {
        return { success: false,intent:"custom", message: "Missing reference number" };
    }
    const sponsorInvalid = fullData.sponsors.find((sponsor) => !sponsorRowSchema.safeParse(sponsor).success);
    const educationInvalid = fullData.education.find((edu) => !educationRowSchema.safeParse(edu).success);
    if(sponsorInvalid || educationInvalid) {
        return { success: false,intent:"custom", message: "Invalid sponsor or education data, please check your inputs" };
    }
    const res = await fetch(process.env.VERIFY_PAYMENT+form.ref_number!, { method: "GET" ,});
    if (!res.ok) {
        throw new Error("Failed to verify payment");
    }
    const paymentData = await res.json();
    if (!paymentData.success) {
        throw new Error("Failed to verify payment");
    }
    if (!paymentData.data.status || paymentData.data.status !== "success") {
        const response = await fetch(process.env.REGISTER+`name=${fullData.firstName}&email=${fullData.email}&phone=${fullData.phone}`, { method: "GET" ,})
        if (!response.ok) {
            throw new Error("Failed to register student");
        }
        let ref_number:string; 
        const data = await response.json();
        if (data.success) {
            ref_number = String(data.data);
            await prismaClient.student.update({
                where:{
                    email: fullData.email
                },
                data:{
                    ref_number
                }
            })
            return { success: false,intent:"payment",link: process.env.PAY+ref_number ,message: "Payment not found, click the button to complete payment" };
        }else{

            throw new Error("No Payment made");
        }
    }
    
    
    
    
    const {sponsors, education} = fullData;
    if(sponsors.length <1  ){
        throw new Error("Sponsor field can not be less than one");

    }
    if(education.length <1  ){
        throw new Error("Education field can not be less than one");

    }
    sponsors.forEach(async (sponsor) => {
        await prismaClient.student_Sponsor.create({
            data: {
                sponsor_name: sponsor.name,
                relationship: sponsor.relationship,
                sponsor_address: sponsor.address,
                sponsor_phone: sponsor.phone,
                sponsor_email: sponsor.email,
                student_id:""
            }
        });
    })
            
        
    education.forEach(async (edu) => {
        await prismaClient.student_Institutes.create({
            data: {     
                school_name: edu.institution,
                certificate: edu.certificate,
                city: edu.location,
                date_from: edu.dateFrom,
                date_to: edu.dateTo,
                student_id:""

            }
        })
    })

     await prismaClient.student.update({
        where: {
            ref_number: fullData.ref_number,
            email: fullData.email,
        },
        data: {
            paid: true,
            status: "complete",
            how_you_found_us: fullData.heardFrom
        }
    });
    return { success: true, message: "ok" }
}
    catch (error) {
        const message =  error instanceof Error ? error.message : "An error occurred"
        
        return { success: false,intent: message.includes("payment")?"payment":"custom" , message   }
    }
}
export async function getStudentData(ref_number:string){
    try {
        const student = await prismaClient.student.findFirst({ 
            where: {
                ref_number: ref_number
            }
        })
        return { success: true, data: student } 

    }catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "An error occurred"   }
    }
}

export async function getAllStudents(){
    try {
        const students = await prismaClient.student.findMany()
        return { success: true, data: students }
    }catch (error) {
        return { success: false, message: error instanceof Error ? error.message : "An error occurred"   }
    }
}

export const isAdmin = async () => {
  const data = (await cookies()).get("_a");
  if (!data) return null;
  const { username, password, email, date } = JSON.parse(data.value);
  if (!username || !password || !date) return null;
  const currentDate = new Date(date).getTime();

  if (!currentDate) {
    return null;
  }

  if (Date.now() > currentDate) {
    return null;
  }
  return {
    username,
    email,
  };
};
export const logAdmin = async (
  username: string,
  password: string,
) => {
  try {
    if (!username || !password) throw new Error("Invalid Felids");
    const isAdmin = await prismaClient.admin.findFirst({
      where: {
        username,
        onBlock: false,
      },
      select: {
        username: true,
        password: true,
        email: true,
      },
    });
    if (!isAdmin) throw new Error("Username or Password Incorrect");
    const legit = bcrypt.compareSync(password, isAdmin.password);
    if (!legit) throw new Error("Username or Password Incorrect");
    const updateAdmin = {
      ...isAdmin,
      date: new Date().setDate(new Date().getDate() + 1),
    };
    await setCookie("_a", JSON.stringify(updateAdmin), );
    return {
      success: true,
    };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "An error occurred" };
  }
};

export const createAdmin = async (
  username: string,
  email: string,
  password: string,
) => {
  try {
    if (!username || !password || !email) throw new Error("Invalid Input");
    const hasInfo = await isAdmin();
    if (!hasInfo) throw new Error("Admin not authorized");
    const isLegit = await prismaClient.admin.findFirst({
      where: { ...hasInfo },
    });
    if (!isLegit) throw new Error("Admin not authorized");

    await prismaClient.admin.create({
      data: {
        username,
        email,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
      },
    });
    return {
      success: true,
    };
  } catch (error) {
    return {success: false, message: error instanceof Error ? error.message : "An error occurred"   }
  }
};