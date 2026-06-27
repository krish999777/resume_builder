import { Page, Text, View, Document, StyleSheet, Link, PDFViewer } from '@react-pdf/renderer'
import type {getResumeType} from '../utils/api'
import { getResume } from '../utils/api'
import {useQuery} from '@tanstack/react-query'
import LoadingSpinner from '../components/LoadingSpinner'

const styles=StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 35,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#222",
    lineHeight: 1.5,
  },

  /* ================= HEADER ================= */

  header: {
    marginBottom: 16,
    alignItems: "center",
  },

  name: {
    fontSize: 30,
    fontWeight: "bold",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 15,
  },

  title: {
    fontSize: 13,
    color: "#555",
    marginBottom: 8,
  },

  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 4,
    fontSize: 10,
    color: "#555",
  },

  link: {
    color: "#0d6efd",
    textDecoration: "none",
  },

  /* ================= SECTIONS ================= */

  section: {
    marginBottom: 14,
},

  sectionHeading: {
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    paddingBottom: 5,
    marginBottom: 10,
  },

  /* ================= COMMON ================= */

item: {
    marginBottom: 8,
},

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  itemTitle: {
    fontSize: 12,
    fontWeight: "bold",
  },

  subTitle: {
    fontSize: 11,
    color: "#555",
    marginTop: 2,
    marginBottom: 5,
  },

paragraph: {
    fontSize: 10.5,
    lineHeight: 1.4,
},

  date: {
    fontSize: 10,
    color: "#666",
  },

  /* ================= PROJECTS ================= */

  linkRow: {
    flexDirection: "row",
    marginTop: 4,
},
  /* ================= SKILLS ================= */

skillsContainer: {
  flexDirection: "row",
  flexWrap: "wrap",
},

skill: {
  fontSize: 10.5,
  marginRight: 8,
  marginBottom: 4,
},

  /* ================= OPTIONAL ================= */

  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    objectFit: "cover",
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 10,
  }
})
function formatDate(date: Date | null) {
  if (!date) return "Present";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}
const ResumeDocument=({resume}:{resume:getResumeType})=>(
    <Document title={`resume-${resume.user.name}-${new Date().toISOString()}`}>
      <Page size="A4" style={styles.page}>
        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <Text style={styles.name}>{resume.user.name.toUpperCase()}</Text>

          <Text style={styles.title}>{resume.title}</Text>

          <View style={styles.contactRow}>
            <Text>{resume.user.email}</Text>

            {resume.linkedin && (
              <>
                <Text> | </Text>

                <Link src={resume.linkedin} style={styles.link}>
                  LinkedIn
                </Link>
              </>
            )}
          </View>
        </View>

        {/* ================= SUMMARY ================= */}

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>
            ABOUT ME
          </Text>

          <Text style={styles.paragraph}>
            {resume.summary}
          </Text>
        </View>

        {/* ================= EDUCATION ================= */}

        {resume.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>
              EDUCATION
            </Text>

            {resume.education.map((education) => (
              <View
                key={education.id}
                style={styles.item}
              >
                <View style={styles.rowBetween}>
                  <Text style={styles.itemTitle}>
                    {education.institution}
                  </Text>

                  <Text style={styles.date}>
                    {formatDate(education.startDate)} -{" "}
                    {formatDate(education.endDate)}
                  </Text>
                </View>

                {education.degree && (
                  <Text style={styles.subTitle}>
                    {education.degree}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ================= EXPERIENCE ================= */}

        {resume.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>
              WORK EXPERIENCE
            </Text>

            {resume.experience.map((experience) => (
              <View
                key={experience.id}
                style={styles.item}
              >
                <View style={styles.rowBetween}>
                  <Text style={styles.itemTitle}>
                    {experience.company}
                  </Text>

                  <Text style={styles.date}>
                    {formatDate(experience.startDate)} -{" "}
                    {formatDate(experience.endDate)}
                  </Text>
                </View>

                <Text style={styles.subTitle}>
                  {experience.role}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ================= PROJECTS ================= */}

        {resume.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>
              PROJECTS
            </Text>

            {resume.projects.map((project) => (
              <View
                key={project.id}
                style={styles.item}
              >
                <Text style={styles.itemTitle}>
                  {project.name}
                </Text>

                <Text style={styles.paragraph}>
                  {project.description}
                </Text>

                <View style={styles.linkRow}>
                    {project.sourceCode && (
                        <>
                            <Link style={styles.link} src={project.sourceCode}>
                                Source Code
                            </Link>

                            {project.deployedLink && (
                                <Text> | </Text>
                            )}
                        </>
                    )}

                    {project.deployedLink && (
                        <Link style={styles.link} src={project.deployedLink}>
                            Live Demo
                        </Link>
                    )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ================= ACHIEVEMENTS ================= */}

        {resume.achievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>
              ACHIEVEMENTS
            </Text>

            {resume.achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={styles.item}
              >
                <Text style={styles.itemTitle}>
                  {achievement.name}
                </Text>

                <Text style={styles.paragraph}>
                  {achievement.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ================= SKILLS ================= */}

        {resume.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>
              SKILLS
            </Text>
            <View style={styles.skillsContainer}>
                {resume.skills.map((skill, index) => (
                    <Text key={skill} style={styles.skill}>
                        {index === resume.skills.length - 1
                            ? skill
                            : `${skill} •`}
                    </Text>
                ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
)
export default function ExportResume(){
    const {data,isPending,error}=useQuery({
        queryFn:getResume,
        queryKey:['resume']
    })
    if(isPending){
        return <LoadingSpinner/>
    }
    if(error||!data||!data.data){
        return(
            <div>
                {error?error.message:'Unknown error'}
            </div>
        )
    }
    return (
        <PDFViewer style={{
            width: "100%",
            height: "100vh",
        }}>
            <ResumeDocument resume={data.data}/>
        </PDFViewer>
    )
}