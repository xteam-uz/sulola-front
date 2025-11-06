import { Link } from "react-router-dom"

export const NotFound = () => {
    return (
        <section className="flex items-center h-dvh p-16 dark:bg-gray-50 dark:text-gray-800">
            <div className="container flex flex-col items-center justify-center px-5 mx-auto my-8">
                <div className="max-w-md text-center">
                    <h2 className="mb-8 font-extrabold text-9xl dark:text-gray-400">
                        <span className="sr-only">Error</span>404
                    </h2>
                    <p className="text-2xl font-semibold md:text-3xl">Kechirasiz, biz bu sahifani topa olmadik.</p>
                    <p className="mt-4 mb-8 dark:text-gray-600">Lekin xavotir olmang, bosh sahifada boshqa ko'plab narsalarni topishingiz mumkin.</p>
                    <Link to='/' className="px-8 py-3 font-semibold rounded dark:bg-blue-600 dark:text-gray-50">
                        Asosiy sahifaga o'tish
                    </Link>
                </div>
            </div>
        </section>
    )
}
