import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Image from 'next/image'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Next JS on AWS-CDK, compiled by <a href="https://github.com/serverless-nextjs/serverless-next.js">Serverless NextJS</a>
        </h1>

        <Image
          src="/vercel.svg"
          alt="Picture of the author"
          width={500}
          height={500}
          priority={true}
        />
      </main>

    </div >
  )
}
