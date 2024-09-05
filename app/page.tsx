import PatientForm from "@/components/forms/PatientForm";
import PasskeyModal from "@/components/PasskeyModal";
import Image from "next/image";
import Link from "next/link";

export default function Home({ searchParams}: SearchParamProps) {

  const isAdmin = searchParams.admin === 'true'

  return (
    <div className="flex h-screen max-h-screen">
      {/* Verificacion con OTP || Modal de clave de acceso */}
      {isAdmin && <PasskeyModal />}

      <section className="remove-scrollbar container">
        <div className="sub-container max-w-[476px] flex-1 flex-col py-10">
          <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="patient"
            className="mb-12 h-10 w-fit"
          />
          <PatientForm />

          <div className="text-14-regular mt-10 flex justify-between py-5">
            <p className="justify-items-end text-dark-600 xl:text-left">
              © 2024 DHIng
            </p>
            <Link href="/?admin=true" className="text-green-500">
              Admin
            </Link>
          </div>
        </div>
      </section>

      <Image
        //Imagen del formulario principal del paciente
        src="/assets/images/onboarding-img.png"
        height={1000}
        width={1000}
        alt="patient"
        className="side-img max-w-[50%]"
      />
    </div>
  );
}
